const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const PLACEHOLDER_SECRETS = new Set([
  'YOUR_API_SECRET_HERE',
  'your_api_secret',
  'your-api-secret',
]);

function getCloudinaryConfig() {
  if (process.env.CLOUDINARY_URL) {
    return {
      cloudinary_url: process.env.CLOUDINARY_URL,
    };
  }

  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };
}

function isCloudinaryConfigured() {
  const { cloudinary_url, cloud_name, api_key, api_secret } = getCloudinaryConfig();

  if (cloudinary_url) {
    return typeof cloudinary_url === 'string' && cloudinary_url.startsWith('cloudinary://');
  }

  if (!cloud_name || !api_key || !api_secret) {
    return false;
  }

  if (PLACEHOLDER_SECRETS.has(api_secret.trim())) {
    return false;
  }

  return true;
}

function ensureCloudinaryConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary configuration is missing or invalid');
  }

  cloudinary.config(getCloudinaryConfig());
}

function shouldUseLocalImageFallback() {
  return process.env.CLOUDINARY_DISABLED === 'true' || process.env.NODE_ENV !== 'production';
}

function isDataUri(value) {
  return typeof value === 'string' && value.startsWith('data:image/');
}

async function uploadImage(image, folder = 'lagronite/items') {
  if (!image) {
    throw new Error('Image is required');
  }

  if (!isDataUri(image)) {
    return image;
  }

  // Ensure uploads folder exists for local storage
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  try {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    // ignore
  }

  // Save a local copy first (filename from nanoid)
  try {
    const matches = image.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (matches) {
      const mime = matches[1];
      const ext = mime.split('/')[1] || 'png';
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');
      const filename = `${nanoid()}.${ext}`;
      const localPath = path.join(uploadsDir, filename);
      await fs.promises.writeFile(localPath, buffer);

      // Build a URL that the frontend can fetch from the backend
      const localUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${filename}`;

      // Continue to upload to Cloudinary in production / when configured
      if (!isCloudinaryConfigured()) {
        return localUrl;
      }

      ensureCloudinaryConfigured();

      // Upload to Cloudinary and return Cloudinary URL, but keep local file for fallback
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          image,
          {
            folder,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              // On upload error, return local URL as fallback
              resolve(localUrl);
              return;
            }

            // Return Cloudinary secure URL but frontend can still fetch local copy if needed
            resolve(result.secure_url || localUrl);
          },
        );
      });
    }
  } catch (err) {
    // If local save fails and Cloudinary is configured, still try cloud upload
    console.warn('Local save failed:', err.message);
  }

  // Fallback: try Cloudinary if configured
  if (!isCloudinaryConfigured()) {
    if (shouldUseLocalImageFallback()) {
      return image;
    }

    throw new Error('Cloudinary configuration is missing or invalid');
  }

  ensureCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      image,
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          if (shouldUseLocalImageFallback()) {
            resolve(image);
            return;
          }

          reject(error);
          return;
        }

        resolve(result.secure_url);
      },
    );
  });
}

async function uploadItemImage(image) {
  return uploadImage(image, 'lagronite/items');
}

async function uploadProfileImage(image) {
  return uploadImage(image, 'lagronite/users');
}

module.exports = {
  cloudinary,
  uploadItemImage,
  uploadProfileImage,
};