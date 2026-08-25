import dotenv from 'dotenv';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const databaseUrl =
  process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/lagronite';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
