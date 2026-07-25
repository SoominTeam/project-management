import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';

import { inngest, functions } from './inngest/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// ========================================
// INNGEST
// ========================================

app.use(
  '/api/inngest',
  serve({
    client: inngest,
    functions,
  })
);

// ========================================
// CLERK
// ========================================

app.use(clerkMiddleware());

// ========================================
// TEST ROUTES
// ========================================

app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

app.get('/api/debug', (req, res) => {
  res.json({
    ok: true,
    auth: req.auth,
  });
});

// ========================================
// ENV CHECK
// ========================================

console.log({
  signing: !!process.env.INNGEST_SIGNING_KEY,
  event: !!process.env.INNGEST_EVENT_KEY,
});

// ========================================
// LOCAL SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});