const path = require('path');
const dotenv = require('dotenv');

// Load root .env explicitly
dotenv.config({
  path: path.join(__dirname, '..', '..', '.env'),
});

const { PrismaClient } = require('@prisma/client');

const databaseUrl =
  process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'MONGODB_URI or DATABASE_URL is missing from .env'
  );
}

// Make sure Prisma uses MONGODB_URI
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = databaseUrl;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;