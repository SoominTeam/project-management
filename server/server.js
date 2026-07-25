import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';

import { inngest, functions } from './inngest/index.js';

const app = express();

app.use(cors());
app.use(express.json());


// =====================================================
// 🔍 GLOBAL DEBUG - BEFORE EVERYTHING
// =====================================================

app.use((req, res, next) => {
  console.log('\n==============================');
  console.log('🚨 INCOMING REQUEST');
  console.log('==============================');

  console.log('➡️ Method:', req.method);
  console.log('➡️ URL:', req.originalUrl);
  console.log('➡️ Path:', req.path);
  console.log('➡️ Host:', req.headers.host);
  console.log('➡️ User-Agent:', req.headers['user-agent']);

  console.log('\n📦 Inngest Headers:');

  console.log(
    'x-inngest-signature:',
    req.headers['x-inngest-signature']
      ? '✅ EXISTS'
      : '❌ MISSING'
  );

  console.log(
    'x-inngest-sdk:',
    req.headers['x-inngest-sdk'] || '❌ MISSING'
  );

  console.log(
    'x-inngest-server-kind:',
    req.headers['x-inngest-server-kind'] || '❌ MISSING'
  );

  console.log(
    'x-inngest-environment:',
    req.headers['x-inngest-environment'] || '❌ MISSING'
  );

  console.log('\n🔑 Environment:');

  console.log(
    'INNGEST_SIGNING_KEY:',
    process.env.INNGEST_SIGNING_KEY
      ? '✅ EXISTS'
      : '❌ MISSING'
  );

  console.log(
    'INNGEST_EVENT_KEY:',
    process.env.INNGEST_EVENT_KEY
      ? '✅ EXISTS'
      : '❌ MISSING'
  );

  console.log('\n==============================\n');

  next();
});


// =====================================================
// 🔥 INNGEST
// =====================================================

console.log('🚀 Registering Inngest route...');

app.use(
  '/api/inngest',
  (req, res, next) => {

    console.log('\n🟣 ENTERED INNGEST ROUTE');

    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);

    console.log(
      'Signature:',
      req.headers['x-inngest-signature']
        ? '✅ EXISTS'
        : '❌ MISSING'
    );

    console.log('Calling Inngest serve()...\n');

    next();
  },

  serve({
    client: inngest,
    functions,
  })
);


// =====================================================
// 🔐 CLERK
// =====================================================

console.log('🔐 Registering Clerk middleware...');

app.use(clerkMiddleware());


// =====================================================
// TEST ROUTES
// =====================================================

app.get('/', (req, res) => {

  console.log('🏠 GET /');

  res.status(200).send('Server is running');
});


app.get('/api/debug', (req, res) => {

  console.log('🐛 GET /api/debug');

  res.json({
    ok: true,
    method: req.method,
    url: req.originalUrl,
    auth: req.auth,
  });
});


// =====================================================
// ENV DEBUG
// =====================================================

console.log('\n================================');
console.log('🔥 SERVER ENV CHECK');
console.log('================================');

console.log(
  'INNGEST_SIGNING_KEY:',
  process.env.INNGEST_SIGNING_KEY
    ? '✅ EXISTS'
    : '❌ MISSING'
);

console.log(
  'INNGEST_EVENT_KEY:',
  process.env.INNGEST_EVENT_KEY
    ? '✅ EXISTS'
    : '❌ MISSING'
);

console.log('================================\n');


// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});