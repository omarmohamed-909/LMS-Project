import mongoose from "mongoose";
import { CourseProgress } from "../models/courseProgress.js";
import { LectureComment } from "../models/lectureComment.model.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";
import { QuizResult } from "../models/quizResult.model.js";

const MAX_QUIZ_ATTEMPTS = 3;

const ensureCourseAccess = async (courseId, userId) => {
  const [course, user, purchase] = await Promise.all([
    Course.findById(courseId),
    User.findById(userId).select("enrolledCourses"),
    CoursePurchase.findOne({ courseId, userId, status: "completed" }),
  ]);

  if (!course) {
    return { error: { status: 404, message: "Course not found" } };
  }

  const isFreeCourse = !course.coursePrice || course.coursePrice <= 0;
  const hasManualAccess = user?.enrolledCourses?.some(
    (enrolledCourseId) => enrolledCourseId.toString() === courseId
  ) ?? false;

  if (!isFreeCourse && !purchase && !hasManualAccess) {
    return {
      error: {
        status: 403,
        message: "You do not have access to this course.",
      },
    };
  }

  return { course };
};

const ensureLectureBelongsToCourse = (course, lectureId) =>
  course?.lectures?.some((courseLectureId) => courseLectureId.toString() === lectureId);

export const getCommentNotifications = async (req, res) => {
  try {
    const userId = req.id;
    const user = req.user;

    let courseIds = [];
    let expectedCommenterRole = null;

    if (user?.role === "instructor") {
      const createdCourses = await Course.find({ creator: userId }).select("_id");
      courseIds = createdCourses.map((course) => course._id.toString());
      expectedCommenterRole = "student";
    } else {
      courseIds = [...new Set((user?.enrolledCourses ?? []).map((courseId) => courseId.toString()))];
      expectedCommenterRole = "instructor";
    }

    if (!courseIds.length || !expectedCommenterRole) {
      return res.status(200).json({
        notifications: [],
      });
    }

    const recentComments = await LectureComment.find({
      courseId: { $in: courseIds.map((id) => new mongoose.Types.ObjectId(id)) },
      userId: { $ne: new mongoose.Types.ObjectId(userId) },
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("userId", "name photoUrl role")
      .lean();

    const filteredComments = recentComments.filter((comment) => {
      if (comment.userId?.role !== expectedCommenterRole) {
        return false;
      }

      if (user?.role === "instructor") {
        // Instructors are notified for student comments on their own courses.
        return true;
      }

      // Students are notified only when instructor explicitly replies to them.
      return comment.replyToUserId?.toString() === userId;
    });

    if (!filteredComments.length) {
      return res.status(200).json({
        notifications: [],
      });
    }

    const groupedNotificationsMap = new Map();

    filteredComments.forEach((comment) => {
      const currentCourseId = comment.courseId.toString();
      const currentLectureId = comment.lectureId.toString();
      const notificationKey = `${currentCourseId}:${currentLectureId}`;
      const existingNotification = groupedNotificationsMap.get(notificationKey);

      if (existingNotification) {
        existingNotification.commentsCount += 1;
        return;
      }

      groupedNotificationsMap.set(notificationKey, {
        notificationKey,
        courseId: currentCourseId,
        lectureId: currentLectureId,
        latestCommentAt: comment.createdAt,
        latestCommentText: comment.text,
        commentsCount: 1,
        commenter: comment.userId
          ? {
              _id: comment.userId._id.toString(),
              name: comment.userId.name,
              photoUrl: comment.userId.photoUrl,
              role: comment.userId.role,
            }
          : null,
      });
    });

    const groupedNotifications = Array.from(groupedNotificationsMap.values())
      .sort((firstItem, secondItem) => secondItem.latestCommentAt - firstItem.latestCommentAt)
      .slice(0, 20);

    const lectureIds = groupedNotifications.map((item) => item.lectureId);

    const [courses, lectures] = await Promise.all([
      Course.find({ _id: { $in: courseIds } }).select("courseTitle"),
      Lecture.find({ _id: { $in: lectureIds } }).select("lectureTitle"),
    ]);

    const courseMap = new Map(courses.map((course) => [course._id.toString(), course]));
    const lectureMap = new Map(lectures.map((lecture) => [lecture._id.toString(), lecture]));

    const notifications = groupedNotifications.map((item) => ({
      ...item,
      courseTitle: courseMap.get(item.courseId)?.courseTitle || "Course",
      lectureTitle: lectureMap.get(item.lectureId)?.lectureTitle || "Lecture",
    }));

    return res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to load comment notifications.",
    });
  }
};

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const accessResult = await ensureCourseAccess(courseId, userId);
    if (accessResult.error) {
      return res.status(accessResult.error.status).json({
        message: accessResult.error.message,
      });
    }

    //step-1 fetch the user course progress
    let courseProgress = await CourseProgress.findOne({
      courseId,
      userId,
    }).populate("courseId");

    const courseDetails = await Course.findById(courseId).populate("lectures");

    //step-2 if no progress found ,return course details with an empty progress
    if (!courseProgress) {
      return res.status(200).json({
        data: {
          courseDetails,
          progress: [],
          completed: false,
        },
      });
    }

    // step-3 return the user's course progress alog with course details
    return res.status(200).json({
      data: {
        courseDetails,
        progress: courseProgress.lectureProgress,
        completed: courseProgress.completed,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateCourseProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    const accessResult = await ensureCourseAccess(courseId, userId);
    if (accessResult.error) {
      return res.status(accessResult.error.status).json({
        message: accessResult.error.message,
      });
    }

    // fetch or create course progress
    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      // if no progress exist, create a new record
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

    // find the lecture progress in the course progress
    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
      // if lecture already exist, update it status
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      // add new lecture progress
      courseProgress.lectureProgress.push({
        lectureId,
        viewed: true,
      });
    }

    //if all lecture is complete
    const lectureProgressLength = courseProgress.lectureProgress.filter(
      (lectureProg) => lectureProg.viewed
    ).length;

    const course = await Course.findById(courseId);
    if (course.lectures.length === lectureProgressLength) {
      courseProgress.completed = true;
    }
    await courseProgress.save();

    return res.status(200).json({
      message: "Course progress updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const accessResult = await ensureCourseAccess(courseId, userId);
    if (accessResult.error) {
      return res.status(accessResult.error.status).json({
        message: accessResult.error.message,
      });
    }

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      return res.status(404).json({
        message: "Course progress not found",
      });
    }
    courseProgress.lectureProgress.map(
      (lectureProgress) => (lectureProgress.viewed = true)
    );
    courseProgress.completed = true;
    await courseProgress.save();
    return res.status(200).json({
      message: "Course marked as completed.",
    });
  } catch (error) {
    console.log(error);
  }
};

export const markAsInCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const accessResult = await ensureCourseAccess(courseId, userId);
    if (accessResult.error) {
      return res.status(accessResult.error.status).json({
        message: accessResult.error.message,
      });
    }

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      return res.status(404).json({
        message: "Course progress not found",
      });
    }
    courseProgress.lectureProgress.map(
      (lectureProgress) => (lectureProgress.viewed = false)
    );
    courseProgress.completed = false;
    await courseProgress.save();
    return res.status(200).json({
      message: "Course marked as incompleted.",
    });
  } catch (error) {
    console.log(error);
  }
};

export const getLectureComments = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    const accessResult = await ensureCourseAccess(courseId, userId);
    if (accessResult.error) {
      return res.status(accessResult.error.status).json({
        message: accessResult.error.message,
      });
    }

    if (!ensureLectureBelongsToCourse(accessResult.course, lectureId)) {
      return res.status(404).json({
        message: "Lecture not found in this course.",
      });
    }

    const comments = await LectureComment.find({ courseId, lectureId })
      .populate({ path: "userId", select: "name photoUrl role" })
      .populate({ path: "replyToUserId", select: "name photoUrl role" })
      .sort({ isPinned: -1, createdAt: -1 });

    return res.status(200).json({
      comments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to load comments.",
    });
  }
};

export const addLectureComment = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;
    const text = req.body?.text?.trim();
    const parentCommentId = req.body?.parentCommentId;

    if (!text) {
      return res.status(400).json({
        message: "Comment text is required.",
      });
    }

    const accessResult = await ensureCourseAccess(courseId, userId);
    if (accessResult.error) {
      return res.status(accessResult.error.status).json({
        message: accessResult.error.message,
      });
    }

    if (!ensureLectureBelongsToCourse(accessResult.course, lectureId)) {
      return res.status(404).json({
        message: "Lecture not found in this course.",
      });
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await LectureComment.findOne({
        _id: parentCommentId,
        courseId,
        lectureId,
      });

      if (!parentComment) {
        return res.status(404).json({
          message: "Parent comment not found.",
        });
      }

      if (parentComment.parentCommentId) {
        return res.status(400).json({
          message: "Replies can only be added to top-level comments.",
        });
      }
    }

    const comment = await LectureComment.create({
      courseId,
      lectureId,
      userId,
      text,
      parentCommentId: parentComment ? parentComment._id : null,
      replyToUserId: parentComment ? parentComment.userId : null,
    });

    const populatedComment = await LectureComment.findById(comment._id)
      .populate({
        path: "userId",
        select: "name photoUrl role",
      })
      .populate({
        path: "replyToUserId",
        select: "name photoUrl role",
      });

    return res.status(201).json({
      comment: populatedComment,
      message: "Comment added successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to add comment.",
    });
  }
};

export const deleteLectureComment = async (req, res) => {
  try {
    const { courseId, lectureId, commentId } = req.params;
    const userId = req.id;

    const accessResult = await ensureCourseAccess(courseId, userId);
    if (accessResult.error) {
      return res.status(accessResult.error.status).json({
        message: accessResult.error.message,
      });
    }

    const comment = await LectureComment.findOne({
      _id: commentId,
      courseId,
      lectureId,
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found.",
      });
    }

    const isCommentOwner = comment.userId.toString() === userId;
    const isInstructor = req.user?.role === "instructor";

    if (!isCommentOwner && !isInstructor) {
      return res.status(403).json({
        message: "You cannot delete this comment.",
      });
    }

    await LectureComment.deleteMany({
      $or: [{ _id: commentId }, { parentCommentId: commentId }],
    });

    return res.status(200).json({
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to delete comment.",
    });
  }
};

export const togglePinLectureComment = async (req, res) => {
  try {
    const { courseId, lectureId, commentId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId).select("creator lectures");
    if (!course) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    if (course.creator?.toString() !== userId) {
      return res.status(403).json({
        message: "Only the course instructor can pin comments.",
      });
    }

    if (!ensureLectureBelongsToCourse(course, lectureId)) {
      return res.status(404).json({
        message: "Lecture not found in this course.",
      });
    }

    const comment = await LectureComment.findOne({
      _id: commentId,
      courseId,
      lectureId,
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found.",
      });
    }

    if (comment.parentCommentId) {
      return res.status(400).json({
        message: "Only top-level comments can be pinned.",
      });
    }

    if (!comment.isPinned) {
      await LectureComment.updateMany(
        { courseId, lectureId, isPinned: true },
        {
          $set: {
            isPinned: false,
            pinnedAt: null,
            pinnedByUserId: null,
          },
        }
      );

      comment.isPinned = true;
      comment.pinnedAt = new Date();
      comment.pinnedByUserId = userId;
      await comment.save();

      return res.status(200).json({
        message: "Comment pinned successfully.",
      });
    }

    comment.isPinned = false;
    comment.pinnedAt = null;
    comment.pinnedByUserId = null;
    await comment.save();

    return res.status(200).json({
      message: "Comment unpinned successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update pinned comment.",
    });
  }
};

// POST /:courseId/lecture/:lectureId/quiz-result
// Student submits their quiz score
export const submitQuizResult = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;
    const { score, totalQuestions } = req.body;

    if (
      typeof score !== "number" ||
      typeof totalQuestions !== "number" ||
      totalQuestions < 1 ||
      score < 0 ||
      score > totalQuestions
    ) {
      return res.status(400).json({ message: "Invalid quiz result data." });
    }

    const accessResult = await ensureCourseAccess(courseId, userId);
    if (accessResult.error) {
      return res
        .status(accessResult.error.status)
        .json({ message: accessResult.error.message });
    }

    if (!ensureLectureBelongsToCourse(accessResult.course, lectureId)) {
      return res.status(404).json({ message: "Lecture not found in this course." });
    }

    const percentage = Math.round((score / totalQuestions) * 100);
    const attemptPayload = {
      score,
      totalQuestions,
      percentage,
      submittedAt: new Date(),
    };

    const existingResult = await QuizResult.findOne({ userId, lectureId })
      .select("_id attemptsCount")
      .lean();

    if (!existingResult) {
      await QuizResult.create({
        userId,
        courseId,
        lectureId,
        score,
        totalQuestions,
        percentage,
        attemptsCount: 1,
        bestScore: score,
        bestPercentage: percentage,
        history: [attemptPayload],
      });

      return res.status(200).json({
        message: "Quiz result saved.",
        attemptsCount: 1,
        maxAttempts: MAX_QUIZ_ATTEMPTS,
        remainingAttempts: MAX_QUIZ_ATTEMPTS - 1,
      });
    } else {
      const currentAttempts = existingResult.attemptsCount || 0;

      if (currentAttempts >= MAX_QUIZ_ATTEMPTS) {
        return res.status(429).json({
          message: `Maximum ${MAX_QUIZ_ATTEMPTS} quiz attempts reached for this lecture.`,
          attemptsCount: currentAttempts,
          maxAttempts: MAX_QUIZ_ATTEMPTS,
          remainingAttempts: 0,
        });
      }

      const nextAttemptsCount = currentAttempts + 1;

      await QuizResult.updateOne(
        { _id: existingResult._id },
        {
          $set: {
            score,
            totalQuestions,
            percentage,
            attemptsCount: nextAttemptsCount,
          },
          $max: {
            bestScore: score,
            bestPercentage: percentage,
          },
          $push: {
            history: attemptPayload,
          },
        }
      );

      return res.status(200).json({
        message: "Quiz result saved.",
        attemptsCount: nextAttemptsCount,
        maxAttempts: MAX_QUIZ_ATTEMPTS,
        remainingAttempts: Math.max(0, MAX_QUIZ_ATTEMPTS - nextAttemptsCount),
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to save quiz result." });
  }
};

// GET /admin/:courseId/quiz-results
// Instructor gets all students' quiz results for a course
export const getCourseQuizResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId).populate("lectures", "lectureTitle quizQuestions");
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (course.creator?.toString() !== userId) {
      return res.status(403).json({ message: "Access denied." });
    }

    const results = await QuizResult.find({ courseId })
      .select("userId lectureId score totalQuestions percentage attemptsCount bestScore bestPercentage updatedAt")
      .populate("userId", "name email photoUrl")
      .populate("lectureId", "lectureTitle")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      courseTitle: course.courseTitle,
      lectures: course.lectures.map((lecture) => ({
        _id: lecture._id,
        lectureTitle: lecture.lectureTitle,
        totalQuestions: lecture.quizQuestions?.length ?? 0,
      })),
      results,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to load quiz results." });
  }
};

// GET /admin/quiz-result/:resultId/history
// Instructor gets attempts history for one quiz result row
export const getQuizResultHistory = async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.id;

    const result = await QuizResult.findById(resultId)
      .select("courseId history attemptsCount")
      .lean();

    if (!result) {
      return res.status(404).json({ message: "Quiz result not found." });
    }

    const course = await Course.findById(result.courseId).select("creator").lean();
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (course.creator?.toString() !== userId) {
      return res.status(403).json({ message: "Access denied." });
    }

    const sortedHistory = [...(result.history || [])].sort(
      (firstItem, secondItem) =>
        new Date(secondItem.submittedAt) - new Date(firstItem.submittedAt)
    );

    return res.status(200).json({
      attemptsCount: result.attemptsCount || sortedHistory.length || 0,
      history: sortedHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to load quiz attempt history." });
  }
};