import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';

import { inngest, functions } from './inngest/index.js';

const app = express();

app.use(express.json());
app.use(cors());

// Inngest BEFORE Clerk
app.use(
  '/api/inngest',
  serve({
    client: inngest,
    functions,
  })
);

// Clerk AFTER Inngest
app.use(clerkMiddleware());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.all('/api/debug', (req, res) => {
  res.json({
    ok: true,
    method: req.method,
    auth: req.auth,
    headers: req.headers,
  });
});

console.log({
  signing: !!process.env.INNGEST_SIGNING_KEY,
  event: !!process.env.INNGEST_EVENT_KEY,
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});