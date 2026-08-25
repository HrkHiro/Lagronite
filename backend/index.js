const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const prisma = require('./utils/prisma');
const authRoutes = require('./routes/authRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');
const foundItemRoutes = require('./routes/foundItemRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const feedRoutes = require('./routes/feedRoutes');
const adminRoutes = require('./routes/adminRoutes')


const app = express();
const port = process.env.PORT || 5000;
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');

app.set('trust proxy', 1);

const extraOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGINS,
]
  .filter(Boolean)
  .flatMap(value => value.split(','))
  .map(origin => origin.trim())
  .filter(Boolean);

if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  extraOrigins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
}

const allowedOrigins = [
  // Local development
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',

  // Production
  'https://lagroniteplatform.site',
  'https://www.lagroniteplatform.site',

  // Render
  'https://lagronite.onrender.com',
  'https://lagronite-backend.onrender.com',

  // Vercel frontend
  'https://lagronite-53vc8561p-lagronite.vercel.app',

  ...extraOrigins,
];

function isAllowedOrigin(origin) {
  // Requests without an Origin header
  if (!origin) return true;

  // Exact allowed origin
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const { hostname } = new URL(origin);

    return (
      hostname === 'lagroniteplatform.site' ||
      hostname === 'www.lagroniteplatform.site' ||
      hostname.endsWith('.onrender.com') ||
      hostname.endsWith('.vercel.app') ||
      hostname.endsWith('.up.railway.app') ||
      hostname.endsWith('.railway.app')
    );
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.error('Blocked CORS origin:', origin);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/lost-items', lostItemRoutes);
app.use('/api/found-items', foundItemRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    return res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

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
    const databaseUrl = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('MONGODB_URI or DATABASE_URL is missing');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from .env');
    }

    await prisma.$connect();
    console.log('MongoDB connected through Prisma');

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('Cloudinary is not configured. Image uploads will store local data URIs in development.');
    } else if (process.env.CLOUDINARY_API_SECRET === 'YOUR_API_SECRET_HERE') {
      console.warn('Cloudinary API secret is still a placeholder. Image uploads will store local data URIs in development.');
    }

    // Create HTTP server for Socket.IO
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (isAllowedOrigin(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
      },
    });

    // Socket.IO authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.warn('Socket connection attempt without token');
        // Allow connection without token for testing, but mark as unauthenticated
        socket.userId = 'anonymous';
        socket.userRole = 'guest';
        socket.userName = 'Anonymous User';
        return next();
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id || decoded.userId;
        socket.userRole = decoded.role;
        socket.userName = decoded.name;
        next();
      } catch (err) {
        console.error('Socket authentication failed:', err.message);
        // Allow connection anyway for development, but with guest role
        socket.userId = 'anonymous';
        socket.userRole = 'guest';
        socket.userName = 'Anonymous User';
        next();
      }
    });

    // Socket.IO connection handler
    io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);

      // Join chat room
      socket.on('join_chat', ({ reportType, reportId }) => {
        const roomId = `chat-${reportType}-${reportId}`;
        socket.join(roomId);
        console.log(`User ${socket.userId} joined room ${roomId}`);
      });

      // Handle new messages
      socket.on('send_message', async (data) => {
        try {
          const { reportType, reportId, text } = data;
          const roomId = `chat-${reportType}-${reportId}`;

          // Broadcast message to all users in the room
          io.to(roomId).emit('new_message', {
            sender: {
              _id: socket.userId,
              name: socket.userName,
              role: socket.userRole,
            },
            text,
            createdAt: new Date(),
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Leave chat room
      socket.on('leave_chat', ({ reportType, reportId }) => {
        const roomId = `chat-${reportType}-${reportId}`;
        socket.leave(roomId);
        console.log(`User ${socket.userId} left room ${roomId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
      });
    });

    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

startServer();