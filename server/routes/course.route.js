import express from "express";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, editCourse, editLecture, getAdminManageableCourses, getCourseById, getCourseLecture, getCreatorCourses, getLectureById, getPublishedCourse, removeLecture, reorderLecture, searchCourse, togglePublishCourse, updateLectureQuiz } from "../controllers/course.controller.js";
import upload from "../utils/multer.js";
import { get } from "mongoose";

const router = express.Router();

router.route("/").post(isAuthenticated,createCourse);
router.route("/search").get(searchCourse);
router.route("/published-courses").get(getPublishedCourse);
router.route("/admin/manageable-courses").get(isAuthenticated, authorizeRoles("instructor"), getAdminManageableCourses);
router.route("/").get(isAuthenticated,getCreatorCourses);
router.route("/:courseId").put(isAuthenticated,upload.single("courseThumbnail"),editCourse);
router.route("/:courseId").get(getCourseById);
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId/reorder").post(isAuthenticated, reorderLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated,editLecture);
router.route("/:courseId/lecture/:lectureId/quiz").patch(isAuthenticated, updateLectureQuiz);
router.route("/lecture/:lectureId").delete(isAuthenticated,removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated,getLectureById);
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);

export default router;