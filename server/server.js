// server.js
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

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// =====================================================
// ✅ TEST WEBHOOK ROUTE
// =====================================================
app.post('/api/webhook-test', (req, res) => {
  console.log('🔔 TEST WEBHOOK RECEIVED!');
  console.log('📦 Body:', req.body);
  console.log('📦 Headers:', req.headers);
  res.json({ 
    success: true, 
    message: 'Webhook received!',
    body: req.body 
  });
});

// =====================================================
// INNGEST ROUTE
// =====================================================
app.use('/api/inngest', (req, res, next) => {
  console.log('🔔🔔🔔 INNGEST WEBHOOK RECEIVED!');
  console.log('METHOD:', req.method);
  console.log('URL:', req.url);
  console.log('HEADERS:', req.headers);
  console.log('BODY:', req.body);
  next();
}, serve({
  client: inngest,
  functions,
}));

app.use('/api/workspaces', protect, workspaceRouter);

app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});