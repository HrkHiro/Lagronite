const { v2: cloudinary } = require('cloudinary');

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