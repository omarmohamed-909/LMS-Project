import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import cors from "cors"
import connectDB from "./database/db.js";
import userRoute from "./routes/user.router.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRote from "./routes/courseProgress.route.js";


dotenv.config({});

//call database connection here
connectDB()
const app = express();

const PORT = process.env.PORT || 3000;

//default middleware
app.use("/api/v1/purchase/webhook", express.raw({ type: "application/json" }))
app.use(express.json())
app.use(cookieParser())

const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

const allowedOrigins = [
    ...envOrigins,
    "https://e-learning-omar.vercel.app",
    "https://lms-project-jczd.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
]

const isAllowedVercelPreview = (origin) =>
    /^https:\/\/(?:lms-project|e-learning-omar)-[a-z0-9-]+\.vercel\.app$/i.test(origin)

const isAllowedLocalDevOrigin = (origin) =>
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin)

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server and tools that do not send Origin header.
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin) || isAllowedVercelPreview(origin) || isAllowedLocalDevOrigin(origin)) return callback(null, true)
        return callback(new Error("Not allowed by CORS"))
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))

// Ensure DB is connected on every request (serverless-safe)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("DB connection failed for request:", req.path, err.message);
        return res.status(503).json({ success: false, message: "Service temporarily unavailable. Please try again shortly." });
    }
})

//apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user",userRoute);
app.use("/api/v1/course",courseRoute);
app.use("/api/v1/purchase",purchaseRoute);
app.use("/api/v1/progress",courseProgressRote);


app.listen(PORT,()=>{
    console.log(`Server listen at port ${PORT}`)
})


