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

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(clerkMiddleware());

// ✅ Route دیباگ برای چک کردن workspace‌ها
app.get('/api/debug-workspaces', async (req, res) => {
  try {
    const all = await prisma.workspace.findMany({
      include: {
        members: true
      }
    });
    res.json({
      count: all.length,
      workspaces: all
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Route تست Webhook
app.post('/api/test-webhook', (req, res) => {
  console.log('🔔 TEST WEBHOOK RECEIVED!');
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  res.json({ success: true, message: 'Webhook works!' });
});

// ✅ Inngest Webhook با لاگ
app.use('/api/inngest', (req, res, next) => {
  console.log('🔔🔔🔔 INNGEST WEBHOOK RECEIVED!');
  console.log('📦 Method:', req.method);
  console.log('📦 URL:', req.url);
  console.log('📦 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📦 Body:', req.body);
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