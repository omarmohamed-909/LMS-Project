 
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import {deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia} from "../utils/cloudinary.js";

const sanitizeQuizQuestions = (quizQuestions = []) => {
    const sanitizedQuizQuestions = [];

    for (const item of quizQuestions) {
        const questionText = item?.questionText?.trim();
        const options = (item?.options || [])
            .map((option) => (typeof option === "string" ? option.trim() : ""))
            .filter(Boolean);
        const correctOptionIndex = Number(item?.correctOptionIndex);

        if (!questionText) {
            return { error: "Each quiz question must include text." };
        }

        if (options.length < 2) {
            return { error: "Each quiz question must include at least 2 options." };
        }

        if (
            Number.isNaN(correctOptionIndex) ||
            correctOptionIndex < 0 ||
            correctOptionIndex >= options.length
        ) {
            return { error: "Each quiz question must have a valid correct option." };
        }

        sanitizedQuizQuestions.push({
            questionText,
            options,
            correctOptionIndex,
        });
    }

    return { data: sanitizedQuizQuestions };
};

export const createCourse = async (req,res) => {
    try {
        const {courseTitle, category} = req.body;
        if(!courseTitle || !category) {
            return res.status(400).json({
                message:"Course title and category is required."
            })
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator:req.id
        });

        return res.status(201).json({
            course,
            message:"Course created."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}

export const searchCourse = async (req,res) => {
    try {
        const {query = "", categories = [], sortByPrice =""} = req.query;
        
        // 1. تنظيف نص البحث لتجنب الأخطاء
        const cleanQuery = query === "undefined" || query === "null" ? "" : query.trim();

        // 2. الشرط الأساسي: الكورس لازم يكون منشور
        const searchCriteria = {
            isPublished: true,
        };

        // 3. البحث بالنص (فقط إذا كتب المستخدم شيئاً)
        if(cleanQuery) {
            searchCriteria.$or = [
                {courseTitle: {$regex:cleanQuery, $options:"i"}},
                {subTitle: {$regex:cleanQuery, $options:"i"}},
                {category: {$regex:cleanQuery, $options:"i"}},
            ];
        }

        // 4. فلترة التصنيفات (✅ هنا التعديل الجديد لحل مشكلة HTML)
        if(categories.length > 0) {
            const categoryArray = Array.isArray(categories) ? categories : categories.split(',').filter(Boolean);
            
            if(categoryArray.length > 0) {
                // استخدمنا RegExp عشان المونجو دي بي يفهم إن html (سمول) هي نفسها HTML (كابيتال)
                searchCriteria.category = { 
                    $in: categoryArray.map((c) => new RegExp(`^${c}$`, 'i')) 
                };
            }
        }

        // 5. ترتيب الكورسات حسب السعر
        const sortOptions = {};
        if(sortByPrice === "low"){
            sortOptions.coursePrice = 1; // تصاعدي
        } else if(sortByPrice === "high"){
            sortOptions.coursePrice = -1; // تنازلي
        }

        // 6. جلب البيانات من الداتا بيز
        let courses = await Course.find(searchCriteria)
            .populate({path:"creator", select:"name photoUrl"})
            .sort(sortOptions);

        return res.status(200).json({
            success: true,
            courses: courses || []
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to search courses"
        });
    }
}

export const getPublishedCourse = async (_,res) => {
    try {
        try {
            const courses = await Course.find({ isPublished: true })
                .populate({ path: "creator", select: "name photoUrl" })
                .sort({ createdAt: -1 });

            return res.status(200).json({
                courses: courses || [],
            });
        } catch (populateError) {
            console.log("getPublishedCourse populate fallback:", populateError?.message || populateError);

            // Fallback: serve published courses even if creator population fails for some records.
            const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
            return res.status(200).json({
                courses: courses || [],
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get published courses"
        })
    }
}
export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({creator:userId});
        if(!courses){
            return res.status(404).json({
                courses:[],
                message:"Course not found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}
export const editCourse = async (req,res) => {
    try {
        const courseId = req.params.courseId;
        const {courseTitle, subTitle, description, category, courseLevel, coursePrice} = req.body;
        const thumbnail = req.file;

        let course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }
        let courseThumbnail;
        if(thumbnail){
            if(course.courseThumbnail){
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId); // delete old image
            }
            // upload a thumbnail on clourdinary
            courseThumbnail = await uploadMedia(thumbnail.path);
        }

 
        const updateData = {courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail:courseThumbnail?.secure_url};

        course = await Course.findByIdAndUpdate(courseId, updateData, {new:true});

        return res.status(200).json({
            course,
            message:"Course updated successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}
export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params;

        const course = await Course.findById(courseId)
            .populate({ path: "creator", select: "name photoUrl" })
            .populate({ path: "lectures" });

        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }
        return res.status(200).json({
            course
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get course by id"
        })
    }
}

export const createLecture = async (req,res) => {
    try {
        const {lectureTitle} = req.body;
        const {courseId} = req.params;

        if(!lectureTitle || !courseId){
            return res.status(400).json({
                message:"Lecture title is required"
            })
        };

        // create lecture
        const lecture = await Lecture.create({lectureTitle});

        const course = await Course.findById(courseId);
        if(course){
            course.lectures.push(lecture._id);
            await course.save();
        }

        return res.status(201).json({
            lecture,
            message:"Lecture created successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create lecture"
        })
    }
}
export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if(!course){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lectures"
        })
    }
}
export const editLecture = async (req,res) => {
    try {
        const {lectureTitle, videoInfo, isPreviewFree} = req.body;
        
        const {courseId, lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            })
        }

        const previousPublicId = lecture.publicId;

        // update lecture
        if(lectureTitle) lecture.lectureTitle = lectureTitle;
        if(typeof videoInfo?.videoUrl === "string" && videoInfo.videoUrl.trim()) {
            const nextVideoUrl = videoInfo.videoUrl.trim();
            const nextPublicId = typeof videoInfo.publicId === "string" ? videoInfo.publicId.trim() : "";

            lecture.videoUrl = nextVideoUrl;
            lecture.publicId = nextPublicId || undefined;

            if (previousPublicId && previousPublicId !== nextPublicId) {
                await deleteVideoFromCloudinary(previousPublicId);
            }
        }
        if (typeof isPreviewFree === "boolean") {
            lecture.isPreviewFree = isPreviewFree;
            lecture.previewEnabledByAdmin = true;
        }

        await lecture.save();

        // Ensure the course still has the lecture id if it was not aleardy added;
        const course = await Course.findById(courseId);
        if(course && !course.lectures.includes(lecture._id)){
            course.lectures.push(lecture._id);
            await course.save();
        };
        return res.status(200).json({
            lecture,
            message:"Lecture updated successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to edit lectures"
        })
    }
}
export const reorderLecture = async (req,res) => {
    try {
        const { courseId, lectureId } = req.params;
        const { direction } = req.body;

        if (!direction || !["up", "down"].includes(direction)) {
            return res.status(400).json({
                message: "Direction must be up or down"
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        const currentIndex = course.lectures.findIndex(
            (item) => item.toString() === lectureId
        );

        if (currentIndex === -1) {
            return res.status(404).json({
                message: "Lecture not found in this course"
            });
        }

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= course.lectures.length) {
            return res.status(400).json({
                message: `Lecture is already at the ${direction === "up" ? "top" : "bottom"}`
            });
        }

        [course.lectures[currentIndex], course.lectures[targetIndex]] = [
            course.lectures[targetIndex],
            course.lectures[currentIndex],
        ];

        await course.save();

        return res.status(200).json({
            message: `Lecture moved ${direction} successfully.`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to reorder lecture"
        });
    }
}
export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        // delete the lecture from couldinary as well
        if(lecture.publicId){
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // Remove the lecture reference from the associated course
        await Course.updateOne(
            {lectures:lectureId}, // find the course that contains the lecture
            {$pull:{lectures:lectureId}} // Remove the lectures id from the lectures array
        );

        return res.status(200).json({
            message:"Lecture removed successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to remove lecture"
        })
    }
}
export const getLectureById = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        return res.status(200).json({
            lecture
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lecture by id"
        })
    }
}


// publich unpublish course logic

export const togglePublishCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {publish} = req.query; // true, false
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            });
        }
        // publish status based on the query paramter
        course.isPublished = publish === "true";
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message:`Course is ${statusMessage}`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to update status"
        })
    }
}
export const getAdminManageableCourses = async (_req, res) => {
    try {
        const courses = await Course.find()
            .select("courseTitle courseThumbnail coursePrice isPublished creator")
            .populate({ path: "creator", select: "name email" })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            courses,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to load courses.",
        });
    }
}

export const updateLectureQuiz = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;
        const { quizQuestions = [] } = req.body;

        if (!Array.isArray(quizQuestions)) {
            return res.status(400).json({
                message: "Quiz questions must be an array.",
            });
        }

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found!",
            });
        }

        const course = await Course.findById(courseId);
        if (!course || !course.lectures.some((item) => item.toString() === lectureId)) {
            return res.status(404).json({
                message: "Lecture not found in this course.",
            });
        }

        const sanitizedResult = sanitizeQuizQuestions(quizQuestions);
        if (sanitizedResult.error) {
            return res.status(400).json({
                message: sanitizedResult.error,
            });
        }

        lecture.quizQuestions = sanitizedResult.data;
        await lecture.save();

        return res.status(200).json({
            lecture,
            message: "Lecture quiz updated successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update lecture quiz",
        });
    }
}