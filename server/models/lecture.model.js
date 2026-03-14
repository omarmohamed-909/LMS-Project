import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    lectureTitle: {
        type: String,
        required: true,
    },
    videoUrl: {type: String,},
    publicId: {type: String,},
    isPreviewFree: {type: Boolean, default: false},
    previewEnabledByAdmin: {type: Boolean, default: false},
    quizQuestions: [
        {
            questionText: {
                type: String,
                trim: true,
                required: true,
            },
            options: {
                type: [String],
                default: [],
            },
            correctOptionIndex: {
                type: Number,
                required: true,
                min: 0,
            },
        }
    ],
}, {timestamps: true});  

export const Lecture = mongoose.model("Lecture", lectureSchema);