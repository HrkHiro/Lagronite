const { PrismaClient } = require('@prisma/client');

const databaseUrl = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('MONGODB_URI or DATABASE_URL is missing from .env');
}

// For Prisma v6+, instantiate PrismaClient directly
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;