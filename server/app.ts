import express from 'express';
export const app = express();
import cors from 'cors';
import cookieParser from 'cookie-parser';

// body parser
app.use(express.json({limit: '50mb'}));

// cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

