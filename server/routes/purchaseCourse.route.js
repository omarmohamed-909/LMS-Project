import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCheckoutSession, getAllPurchasedCourse, getCourseDetailWithPurchaseStatus, stripeWebhook, verifyCheckoutSession } from "../controllers/coursePurchase.controller.js";
import { get } from "mongoose";


const router = express.Router();

router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);
router.route("/checkout/verify-session").post(isAuthenticated, verifyCheckoutSession);
router.route("/webhook").post(stripeWebhook);
router.route("/course/:courseId/detail-with-status").get(isAuthenticated,getCourseDetailWithPurchaseStatus);

router.route("/").get(isAuthenticated,getAllPurchasedCourse);

export default router;