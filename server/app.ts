import express from 'express';
export const app = express();
import cors from 'cors';
import cookieParser from 'cookie-parser';

// body parser
app.use(express.json({limit: '50mb'}));

// cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [
    ...envOrigins,
    "https://e-learning-omar.vercel.app",
    "https://lms-project-jczd.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
];

const isAllowedVercelPreview = (origin: string) =>
    /^https:\/\/(?:lms-project|e-learning-omar)-[a-z0-9-]+\.vercel\.app$/i.test(origin);

const isAllowedLocalDevOrigin = (origin: string) =>
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || isAllowedVercelPreview(origin) || isAllowedLocalDevOrigin(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

