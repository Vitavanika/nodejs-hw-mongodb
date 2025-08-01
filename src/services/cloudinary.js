import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const savePhotoToCloudinary = async (file) => {
  if (!file) return null;

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'contacts',
    });
    await fs.unlink(file.path);

    console.log('Successfully uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    await fs.unlink(file.path);
    return null;
  }
};
