import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';
import prisma, { testDatabaseConnection } from './configs/prisma.js';

import workspaceRouter from './routes/workspaceRoutes.js';
import { protect } from './middleware/authMiddleware.js';

const app = express();

// =====================================================
// 🚀 DATABASE CONNECTION TEST
// =====================================================

console.log('🚀 Starting server...');

try {
  await testDatabaseConnection();
  console.log('✅ Database is ready!');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  if (process.env.VERCEL) {
    process.exit(1);
  }
}

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// =====================================================
// INNGEST ROUTE
// =====================================================

app.use('/api/inngest', serve({
  client: inngest,
  functions,
}));

// =====================================================
// ROUTES
// =====================================================

app.use('/api/workspaces', protect, workspaceRouter);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});