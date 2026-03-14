import {User} from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { sendEmail } from "../utils/sendEmail.js";

const getFrontendUrl = () => (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const buildVerificationResponse = ({ verificationPath, verificationUrl, emailSent }) => {
    const includeDirectLink = process.env.NODE_ENV !== "production" || !emailSent;

    return {
        verificationPath: includeDirectLink ? verificationPath : undefined,
        verificationUrl: includeDirectLink ? verificationUrl : undefined,
        emailSent,
    };
};

const createEmailVerificationToken = (userId, email) => {
    return jwt.sign(
        { userId, email, purpose: "verify-email" },
        process.env.SECRET_KEY,
        { expiresIn: "1d" }
    );
};

const sendVerificationEmail = async (user) => {
    const verificationToken = createEmailVerificationToken(user._id, user.email);
    const verificationPath = `/verify-email/${verificationToken}`;
    const verificationUrl = `${getFrontendUrl()}${verificationPath}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
        <h2 style="margin-bottom:12px;">Verify your email</h2>
        <p style="line-height:1.7;margin-bottom:16px;">Hi ${user.name}, click the button below to activate your account.</p>
        <a href="${verificationUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600;">Verify email</a>
        <p style="line-height:1.7;margin-top:16px;">If the button does not work, open this link:</p>
        <p style="word-break:break-all;color:#475569;">${verificationUrl}</p>
        <p style="line-height:1.7;margin-top:16px;">This link expires in 24 hours.</p>
      </div>
    `;

    const text = `Verify your email by opening this link: ${verificationUrl}`;
    let emailSent = false;

    try {
        const mailResult = await sendEmail({
            to: user.email,
            subject: "Verify your LMS account",
            html,
            text,
        });

        emailSent = mailResult.sent;
    } catch (error) {
        console.log(error);
    }

    user.emailVerificationSentAt = new Date();
    await user.save();

    return {
        verificationPath,
        verificationUrl,
        emailSent,
    };
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const createResetPasswordToken = (userId) => {
    return jwt.sign(
        { userId, purpose: "reset-password" },
        process.env.SECRET_KEY,
        { expiresIn: "15m" }
    );
};
export const register = async (req ,res) =>{
    try {
             const {name, email,password}= req.body;
       if(!name || !email || !password){
          return res.status(400).json({
            success:false,
            message:"All fileds are required."
          })
       }
             const normalizedEmail = normalizeEmail(email);
             const user = await User.findOne({email: normalizedEmail});
       if(user){
        return res.status(400).json({
            success:false,
            message:"User already exist with this email."
        })
       }
       const hashedPassword = await bcrypt.hash(password, 10);
             const createdUser = await User.create({
                name: name.trim(),
                email: normalizedEmail,
                password:hashedPassword
             })

             const verificationDetails = await sendVerificationEmail(createdUser);

       return res.status(201).json({
        success:true,
                message:"Account created. Verify your email before logging in.",
                verificationRequired:true,
                email: createdUser.email,
                ...buildVerificationResponse(verificationDetails)
       })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Failded to register"
        })
    }
}

export const login = async (req,res) => {
    try {
        const {email, password}=req.body;
        if(!email || !password){
          return res.status(400).json({
            success:false,
            message:"All fileds are required."
          })
       }
       const normalizedEmail = normalizeEmail(email);
       const user = await User.findOne({email: normalizedEmail});
       if(!user){
        return res.status(400).json({
            success:false,
            message:"Incorect email or password"
        })
       }
       if(!user.emailVerified){
        return res.status(403).json({
            success:false,
            requiresVerification:true,
            email:user.email,
            message:"Please verify your email before logging in."
        })
       }
       const isPasswordMatch = await bcrypt.compare(password, user.password)
       if(!isPasswordMatch){
        return res.status(400).json({
            success:false,
            message:"Incorect email or password"
        })
       }
       generateToken(res, user, `welcome back ${user.name}`)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Failded to login"
        })
    }
}
export const logout =async(_,res)=>{
    try {
        return res.status(200).cookie("token","",{maxAge:0}).json({
            message:"Loged out successfully.",
            success:true
        })
    } catch (error) {
         console.log(error)
        return res.status(500).json({
            success:false,
            message:"Failded to Logout"
        })
    }
}
export const getUserProfile = async (req,res) =>{
    try {
        const userId= req.id;
                const user = await User.findById(userId)
                    .select("-password")
                    .populate({
                        path: "enrolledCourses",
                        populate: {
                            path: "creator",
                            select: "name photoUrl",
                        },
                    });
        if(!user){
            return res.status(404).json({
                message:"profile not found",
                success:false,    
        })
    }
        return res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Failded to load user"
        })
    }
}
export const updateProfile = async(req,res)=>{
    try {
        const userId = req.id;
        const {name, currentPassword, newPassword, confirmPassword} = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);
        if(!user){
               return res.status(404).json({
                message:"user not found",
                success:false,    
        })
        }
        let photoUrl = user.photoUrl;

        if(profilePhoto){
            if(user.photoUrl){
                const publicId = user.photoUrl.split("/").pop().split(".")[0];
                deleteMediaFromCloudinary(publicId);
            }

            const cloudResponse = await uploadMedia(profilePhoto.path);
            photoUrl = cloudResponse.secure_url;
        }

        const updatedData = {
            name: name?.trim() || user.name,
            photoUrl,
        };

        const wantsPasswordChange = Boolean(
            currentPassword?.trim() || newPassword?.trim() || confirmPassword?.trim()
        );

        if (wantsPasswordChange) {
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Current password, new password, and confirm password are required.",
                });
            }

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect.",
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "New password must be at least 6 characters.",
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Confirm password does not match.",
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updatedData.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");
      
        return res.status(200).json({
            success:true,
            user:updatedUser,
            message:"Profile updated successfully",
        })
        

    } catch (error) {
         return res.status(500).json({
            success:false,
            message:"Failded to update profile"
        }) 
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const user = await User.findOne({ email: normalizeEmail(email) });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account with this email exists, a reset link has been generated.",
            });
        }

        const resetToken = createResetPasswordToken(user._id);
        const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
        const resetPath = `/reset-password/${resetToken}`;
        const resetUrl = `${frontendUrl}${resetPath}`;

        return res.status(200).json({
            success: true,
            message: "Reset link generated successfully.",
            resetPath,
            resetUrl,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to process forgot password request.",
        });
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        if (decoded?.purpose !== "verify-email") {
            return res.status(400).json({
                success: false,
                message: "Invalid verification link.",
            });
        }

        const user = await User.findById(decoded.userId);

        if (!user || user.email !== decoded.email) {
            return res.status(400).json({
                success: false,
                message: "Verification link is invalid or expired.",
            });
        }

        if (user.emailVerified) {
            return res.status(200).json({
                success: true,
                alreadyVerified: true,
                message: "Email is already verified. You can log in now.",
            });
        }

        user.emailVerified = true;
        user.emailVerificationSentAt = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You can log in now.",
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Verification link is invalid or expired.",
        });
    }
};

export const resendVerificationEmail = async (req, res) => {
    try {
        const normalizedEmail = normalizeEmail(req.body?.email);

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email.",
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: "This email is already verified.",
            });
        }

        if (
            user.emailVerificationSentAt &&
            Date.now() - user.emailVerificationSentAt.getTime() < 60 * 1000
        ) {
            return res.status(429).json({
                success: false,
                message: "Please wait a minute before requesting another verification email.",
            });
        }

        const verificationDetails = await sendVerificationEmail(user);

        return res.status(200).json({
            success: true,
            message: verificationDetails.emailSent
                ? "Verification email sent successfully."
                : "Verification link generated successfully.",
            email: user.email,
            ...buildVerificationResponse(verificationDetails),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to resend verification email.",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required.",
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        if (decoded?.purpose !== "reset-password") {
            return res.status(400).json({
                success: false,
                message: "Invalid reset token.",
            });
        }

        const user = await User.findById(decoded.userId);

        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Reset token is invalid or expired.",
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Reset token is invalid or expired.",
        });
    }
}

export const getAdminUsers = async (_req, res) => {
    try {
        const users = await User.find()
            .select("name email role photoUrl enrolledCourses createdAt")
            .populate({
                path: "enrolledCourses",
                select: "courseTitle courseThumbnail coursePrice isPublished",
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to load users.",
        });
    }
};

export const deleteAdminUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.id;

        if (userId === requestingUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account.",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.photoUrl) {
            const publicId = user.photoUrl.split("/").pop().split(".")[0];
            await deleteMediaFromCloudinary(publicId).catch(() => {});
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            success: true,
            message: `User "${user.name}" deleted successfully.`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete user.",
        });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role || !["student", "instructor"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "A valid role is required.",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        user.role = role;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "User role updated successfully.",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update user role.",
        });
    }
};

export const updateUserCourseAccess = async (req, res) => {
    try {
        const { userId } = req.params;
        const { courseId, action } = req.body;

        if (!courseId || !["grant", "revoke"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Course id and a valid action are required.",
            });
        }

        const [user, course] = await Promise.all([
            User.findById(userId),
            Course.findById(courseId),
        ]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        if (action === "grant") {
            await Promise.all([
                User.findByIdAndUpdate(userId, {
                    $addToSet: { enrolledCourses: courseId },
                }),
                Course.findByIdAndUpdate(courseId, {
                    $addToSet: { enrolledStudents: userId },
                }),
            ]);

            return res.status(200).json({
                success: true,
                message: "Course access granted successfully.",
            });
        }

        const completedPurchase = await CoursePurchase.findOne({
            userId,
            courseId,
            status: "completed",
        });

        if (completedPurchase) {
            return res.status(400).json({
                success: false,
                message: "This user purchased the course, so access cannot be revoked here.",
            });
        }

        await Promise.all([
            User.findByIdAndUpdate(userId, {
                $pull: { enrolledCourses: courseId },
            }),
            Course.findByIdAndUpdate(courseId, {
                $pull: { enrolledStudents: userId },
            }),
        ]);

        return res.status(200).json({
            success: true,
            message: "Course access revoked successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update course access.",
        });
    }
};