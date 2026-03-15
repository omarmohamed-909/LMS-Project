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
        secure: true,
    });
} else if (hasCloudinaryUrl) {
    cloudinary.config({ secure: true });
}

const ensureCloudinaryConfig = () => {
    if (!hasCloudinaryConfig) {
        throw new Error("Cloudinary is not configured");
    }
};

const uploadBufferWithStream = (fileBuffer, options = {}) =>
    new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                ...options,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });

export const uploadMedia = async (file, options = {}) => {
    ensureCloudinaryConfig();

    try {
        if (Buffer.isBuffer(file)) {
            return await uploadBufferWithStream(file, options);
        }

        const uploadResponse = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
            ...options,
        });
        return uploadResponse;
    } catch (error) {
        console.error("Cloudinary upload error:", error?.message || error);
        throw new Error("Media upload failed");
    }
};

export const createCloudinaryUploadSignature = (paramsToSign = {}) => {
    ensureCloudinaryConfig();

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        cloudinaryConfig.api_secret || cloudinary.config().api_secret
    );

    return {
        signature,
        apiKey: cloudinaryConfig.api_key || cloudinary.config().api_key,
        cloudName: cloudinaryConfig.cloud_name || cloudinary.config().cloud_name,
    };
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