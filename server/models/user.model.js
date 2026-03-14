import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["instructor" , "student"],
        default:'student'
    },
    enrolledCourses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Course'
        }
    ],
    photoUrl:{
        type:String,
        default:""
    },
    emailVerified:{
        type:Boolean,
        default:false
    },
    emailVerificationSentAt:{
        type:Date,
        default:null
    },
    resetPasswordExpires:{
        type:Date,
        default:null
    }
},{timestamps:true})

export const User = mongoose.model("User",userSchema)