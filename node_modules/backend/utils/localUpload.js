const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function saveItemImageLocally(imageData) {
  if (!imageData) {
    throw new Error('No image data provided');
  }

  const matches = imageData.match(/^data:(image\/\w+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid image data format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const extension = mimeType.split('/')[1];

  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  fs.writeFileSync(filePath, base64Data, 'base64');

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  return `${backendUrl}/uploads/${fileName}`;
}

module.exports = { saveItemImageLocally };