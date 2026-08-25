const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Siguraduhing existing yung uploads folder
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function saveItemImageLocally(imageData) {
  if (!imageData) {
    throw new Error('No image data provided');
  }

  // Inaasahang format: "data:image/png;base64,iVBORw0KGgo..."
  const matches = imageData.match(/^data:(image\/\w+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid image data format');
  }

  const mimeType = matches[1]; // e.g. "image/png"
  const base64Data = matches[2];
  const extension = mimeType.split('/')[1]; // e.g. "png"

  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  fs.writeFileSync(filePath, base64Data, 'base64');

  // I-return yung relative URL path na ise-serve mo bilang static
  return `/uploads/${fileName}`;
}

module.exports = { saveItemImageLocally };