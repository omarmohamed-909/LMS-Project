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

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://lms-project-jczd.vercel.app",
    "http://localhost:5173"
].filter(Boolean)

const isAllowedVercelPreview = (origin) =>
    /^https:\/\/lms-project-[a-z0-9-]+\.vercel\.app$/i.test(origin)

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server and tools that do not send Origin header.
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin) || isAllowedVercelPreview(origin)) return callback(null, true)
        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true
}))

//apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user",userRoute);
app.use("/api/v1/course",courseRoute);
app.use("/api/v1/purchase",purchaseRoute);
app.use("/api/v1/progress",courseProgressRote);


app.listen(PORT,()=>{
    console.log(`Server listen at port ${PORT}`)
})


