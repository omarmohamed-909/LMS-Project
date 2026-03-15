import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config({});

const parseCloudinaryUrl = (cloudinaryUrl) => {
    if (!cloudinaryUrl) {
        return null;
    }

    try {
        const parsedUrl = new URL(cloudinaryUrl);

        return {
            api_key: decodeURIComponent(parsedUrl.username || ""),
            api_secret: decodeURIComponent(parsedUrl.password || ""),
            cloud_name: parsedUrl.hostname || "",
        };
    } catch (error) {
        console.error("Invalid CLOUDINARY_URL:", error?.message || error);
        return null;
    }
};

const specificCloudinaryConfig = {
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
};

const legacyCloudinaryConfig = {
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    cloud_name: process.env.CLOUD_NAME,
};

const cloudinaryUrlConfig = parseCloudinaryUrl(process.env.CLOUDINARY_URL);

const hasCloudinaryUrl =
    Boolean(cloudinaryUrlConfig?.api_key) &&
    Boolean(cloudinaryUrlConfig?.api_secret) &&
    Boolean(cloudinaryUrlConfig?.cloud_name);

const hasSpecificCloudinaryConfig =
    Boolean(specificCloudinaryConfig.api_key) &&
    Boolean(specificCloudinaryConfig.api_secret) &&
    Boolean(specificCloudinaryConfig.cloud_name);

const hasLegacyCloudinaryConfig =
    Boolean(legacyCloudinaryConfig.api_key) &&
    Boolean(legacyCloudinaryConfig.api_secret) &&
    Boolean(legacyCloudinaryConfig.cloud_name);

const cloudinaryConfig = hasCloudinaryUrl
    ? cloudinaryUrlConfig
    : hasSpecificCloudinaryConfig
        ? specificCloudinaryConfig
        : legacyCloudinaryConfig;

const hasCloudinaryConfig =
    hasCloudinaryUrl || hasSpecificCloudinaryConfig || hasLegacyCloudinaryConfig;

if (!hasCloudinaryConfig) {
    console.error("Cloudinary config missing. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET on deployment.");
}

if (hasCloudinaryConfig) {
    cloudinary.config({
        api_key: cloudinaryConfig.api_key,
        api_secret: cloudinaryConfig.api_secret,
        cloud_name: cloudinaryConfig.cloud_name,
        secure: true,
    });
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
        cloudinary.config().api_secret
    );

    return {
        signature,
        apiKey: cloudinary.config().api_key,
        cloudName: cloudinary.config().cloud_name,
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