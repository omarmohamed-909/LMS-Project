import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config({});

const cloudinaryConfig = {
    api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
};

const hasCloudinaryConfig =
    Boolean(cloudinaryConfig.api_key) &&
    Boolean(cloudinaryConfig.api_secret) &&
    Boolean(cloudinaryConfig.cloud_name);

if (!hasCloudinaryConfig) {
    console.error("Cloudinary config missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on deployment.");
}

cloudinary.config({
    api_key: cloudinaryConfig.api_key,
    api_secret: cloudinaryConfig.api_secret,
    cloud_name: cloudinaryConfig.cloud_name,
});

export const uploadMedia = async(file)=>{
    try {
        if (!hasCloudinaryConfig) {
            throw new Error("Cloudinary is not configured");
        }

        const uploadResponse = await cloudinary.uploader.upload(file, {
            resource_type:"auto"
        });
        return uploadResponse;
    } catch (error) {
        console.error("Cloudinary upload error:", error?.message || error);
        throw new Error("Media upload failed");
    }
}

export const deleteMediaFromCloudinary = async(publicId)=>{
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.log(error)
    }
};

export const deleteVideoFromCloudinary = async (publicId)=>{
    try {
        await cloudinary.uploader.destroy(publicId,{resource_type:"video"})
    } catch (error) {
        console.log(error);   
    }
}