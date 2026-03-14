import express from "express";
import {
	deleteAdminUser,
	forgotPassword,
	getAdminUsers,
	getUserProfile,
	login,
	logout,
	register,
	resendVerificationEmail,
	resetPassword,
	updateUserCourseAccess,
	updateProfile,
	updateUserRole,
	verifyEmail,
} from "../controllers/user.controller.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/verify-email/resend").post(resendVerificationEmail);
router.route("/verify-email/:token").post(verifyEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/profile").get(isAuthenticated ,getUserProfile);
router.route("/profile/update").put(isAuthenticated ,upload.single("profilePhoto") ,updateProfile);
router.route("/admin/users").get(isAuthenticated, authorizeRoles("instructor"), getAdminUsers);
router.route("/admin/users/:userId").delete(isAuthenticated, authorizeRoles("instructor"), deleteAdminUser);
router.route("/admin/users/:userId/role").patch(isAuthenticated, authorizeRoles("instructor"), updateUserRole);
router.route("/admin/users/:userId/course-access").patch(isAuthenticated, authorizeRoles("instructor"), updateUserCourseAccess);

export default router;