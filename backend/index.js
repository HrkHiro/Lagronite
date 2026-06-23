const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');
const foundItemRoutes = require('./routes/foundItemRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const feedRoutes = require('./routes/feedRoutes');
const adminRoutes = require('./routes/adminRoutes')


const app = express();
const port = process.env.PORT || 5000;
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/lost-items', lostItemRoutes);
app.use('/api/found-items', foundItemRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/admin', adminRoutes)
app.use('/api/admin', require('./routes/adminRoutes'))

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Image upload is too large. Please use a smaller image.' });
  }

  return next(error);
});

async function startServer() {
  try {
    if (!process.env.MONGOURL) {
      throw new Error('MONGOURL is missing from .env');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from .env');
    }

    await mongoose.connect(process.env.MONGOURL, {
      serverSelectionTimeoutMS: 10000,
    });

    await mongoose.connection.db.command({ ping: 1 });

    console.log('MongoDB connected');

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('Cloudinary is not configured. Image uploads will store local data URIs in development.');
    } else if (process.env.CLOUDINARY_API_SECRET === 'YOUR_API_SECRET_HERE') {
      console.warn('Cloudinary API secret is still a placeholder. Image uploads will store local data URIs in development.');
    }

    app.listen(port, () => {
      console.log(`Backend server running on port ${port}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

startServer();