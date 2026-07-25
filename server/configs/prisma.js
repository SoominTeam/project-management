import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless'; // Pool اضافه شد

import ws from 'ws'; // import the WebSocket constructor
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL missing");
}

// مرحله اول: ساخت یک Pool برای نئون
const pool = new Pool({ connectionString });

// مرحله دوم: پاس دادن Pool به آداپتور پریزما
const adapter = new PrismaNeon(pool);

const prisma = global.prisma || new PrismaClient({ adapter });

// شرط صحیح: اگر در محیط پروداکشن "نیستیم" (یعنی در حال توسعه هستیم)، آن را در گلوبال ذخیره کن
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;