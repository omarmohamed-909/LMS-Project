import express from 'express';
import isAuthenticated  from '../middlewares/isAuthenticated.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
import {
	addLectureComment,
	deleteLectureComment,
	getCommentNotifications,
	getCourseProgress,
	getCourseQuizResults,
	getQuizResultHistory,
	getLectureComments,
	markAsCompleted,
	markAsInCompleted,
	submitQuizResult,
	togglePinLectureComment,
	updateCourseProgress,
} from '../controllers/courseProgress.controller.js';

const router = express.Router();

router.route('/comment-notifications').get(isAuthenticated, getCommentNotifications);
router.route('/admin/:courseId/quiz-results').get(isAuthenticated, authorizeRoles('instructor'), getCourseQuizResults);
router.route('/admin/quiz-result/:resultId/history').get(isAuthenticated, authorizeRoles('instructor'), getQuizResultHistory);
router.route('/:courseId').get(isAuthenticated, getCourseProgress);
router.route('/:courseId/lecture/:lectureId/view').post(isAuthenticated, updateCourseProgress);
router.route('/:courseId/lecture/:lectureId/quiz-result').post(isAuthenticated, submitQuizResult);
router.route('/:courseId/lecture/:lectureId/comments').get(isAuthenticated, getLectureComments).post(isAuthenticated, addLectureComment);
router.route('/:courseId/lecture/:lectureId/comments/:commentId').delete(isAuthenticated, deleteLectureComment);
router.route('/:courseId/lecture/:lectureId/comments/:commentId/pin').patch(isAuthenticated, togglePinLectureComment);
router.route('/:courseId/complete').post(isAuthenticated, markAsCompleted);
router.route('/:courseId/incomplete').post(isAuthenticated, markAsInCompleted);

export default router;