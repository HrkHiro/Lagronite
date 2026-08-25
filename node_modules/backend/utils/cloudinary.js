const { v2: cloudinary } = require('cloudinary');

const PLACEHOLDER_SECRETS = new Set([
  'YOUR_API_SECRET_HERE',
  'YOUR_CLOUDINARY_API_SECRET',
  'your_api_secret',
  'your-api-secret',
]);

function getCloudinaryConfig() {
  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
  };
}

function isCloudinaryConfigured() {
  const { cloud_name, api_key, api_secret } = getCloudinaryConfig();

  if (!cloud_name || !api_key || !api_secret) {
    return false;
  }

  if (PLACEHOLDER_SECRETS.has(api_secret)) {
    return false;
  }

  return true;
}

function ensureCloudinaryConfigured() {
  const config = getCloudinaryConfig();

  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary configuration is missing or invalid. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }

  cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret,
  });
}

function shouldUseLocalImageFallback() {
  return (
    process.env.CLOUDINARY_DISABLED === 'true' ||
    process.env.NODE_ENV !== 'production'
  );
}

function isDataUri(value) {
  return (
    typeof value === 'string' &&
    value.startsWith('data:image/')
  );
}

async function uploadImage(image, folder = 'lagronite/items') {
  if (!image) {
    throw new Error('Image is required');
  }

  // If image is already a URL, don't upload it again.
  if (!isDataUri(image)) {
    return image;
  }

  if (!isCloudinaryConfigured()) {
    if (shouldUseLocalImageFallback()) {
      console.warn(
        'Cloudinary is not configured. Using local image fallback.'
      );

      return image;
    }

    throw new Error(
      'Cloudinary configuration is missing or invalid.'
    );
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
          console.error('Cloudinary upload failed:', error);

          if (shouldUseLocalImageFallback()) {
            console.warn(
              'Cloudinary upload failed. Using local image fallback.'
            );

            resolve(image);
            return;
          }

          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(
            new Error('Cloudinary upload succeeded but no secure URL was returned.')
          );
          return;
        }

        resolve(result.secure_url);
      }
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
  isCloudinaryConfigured,
};