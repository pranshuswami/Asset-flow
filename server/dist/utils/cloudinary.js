"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = uploadToCloudinary;
exports.deleteFromCloudinary = deleteFromCloudinary;
const cloudinary_1 = require("cloudinary");
const env_1 = require("../config/env");
if (env_1.env.cloudinaryCloudName && env_1.env.cloudinaryApiKey && env_1.env.cloudinaryApiSecret) {
    cloudinary_1.v2.config({
        cloud_name: env_1.env.cloudinaryCloudName,
        api_key: env_1.env.cloudinaryApiKey,
        api_secret: env_1.env.cloudinaryApiSecret,
    });
}
async function uploadToCloudinary(file, folder = "assetflow") {
    const buffer = file.buffer;
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader
            .upload_stream({ folder, resource_type: "auto" }, (err, result) => {
            if (err)
                return reject(err);
            resolve(result);
        })
            .end(buffer);
    });
}
async function deleteFromCloudinary(publicId) {
    return cloudinary_1.v2.uploader.destroy(publicId);
}
//# sourceMappingURL=cloudinary.js.map