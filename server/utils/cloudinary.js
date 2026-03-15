import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config({});

const cloudinaryConfig = {
    api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
};

const hasCloudinaryUrl = Boolean(process.env.CLOUDINARY_URL);
const hasExplicitCloudinaryConfig =
    Boolean(cloudinaryConfig.api_key) &&
    Boolean(cloudinaryConfig.api_secret) &&
    Boolean(cloudinaryConfig.cloud_name);

const hasCloudinaryConfig =
    hasExplicitCloudinaryConfig || hasCloudinaryUrl;

if (!hasCloudinaryConfig) {
    console.error("Cloudinary config missing. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET on deployment.");
}

if (hasExplicitCloudinaryConfig) {
    cloudinary.config({
        api_key: cloudinaryConfig.api_key,
        api_secret: cloudinaryConfig.api_secret,
        cloud_name: cloudinaryConfig.cloud_name,
    });
}

export const uploadMedia = async (file) => {
    if (!hasCloudinaryConfig) {
        throw new Error("Cloudinary is not configured");
    }

    try {
        // Convert Buffer (memoryStorage) to base64 data URI — works reliably on Vercel serverless.
        const uploadSource = Buffer.isBuffer(file)
            ? `data:application/octet-stream;base64,${file.toString("base64")}`
            : file;

        const uploadResponse = await cloudinary.uploader.upload(uploadSource, {
            resource_type: "auto",
        });
        return uploadResponse;
    } catch (error) {
        console.error("Cloudinary upload error:", error?.message || error);
        throw new Error("Media upload failed");
    }
};

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