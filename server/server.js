import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';

import { inngest, functions } from './inngest/index.js';

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());


// =====================================================
// 🔍 GLOBAL REQUEST DEBUG
// =====================================================

app.use((req, res, next) => {
  console.log('\n========================================');
  console.log('🚨 REQUEST START');
  console.log('========================================');

  console.log('METHOD:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('PATH:', req.path);
  console.log('HOST:', req.headers.host);
  console.log('USER AGENT:', req.headers['user-agent']);

  console.log('\n📦 INNGEST HEADERS');

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

  console.log('\n🔑 ENVIRONMENT');

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

  // Response status
  res.on('finish', () => {
    console.log('\n🏁 RESPONSE FINISHED');
    console.log('URL:', req.originalUrl);
    console.log('STATUS:', res.statusCode);
    console.log('========================================\n');
  });

  next();
});


// =====================================================
// 🔥 INNGEST ROUTE
// =====================================================

console.log('🚀 Registering Inngest route...');

app.use(
  '/api/inngest',

  (req, res, next) => {
    console.log('\n🟣🟣🟣 ENTERED INNGEST ROUTE 🟣🟣🟣');

    console.log('METHOD:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('PATH:', req.path);

    console.log(
      'SIGNATURE:',
      req.headers['x-inngest-signature']
        ? '✅ EXISTS'
        : '❌ MISSING'
    );

    console.log(
      'SDK:',
      req.headers['x-inngest-sdk'] || '❌ MISSING'
    );

    console.log(
      'SERVER KIND:',
      req.headers['x-inngest-server-kind'] || '❌ MISSING'
    );

    console.log('➡️ Passing request to Inngest serve()...');

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
// 🏠 ROOT ROUTE
// =====================================================

app.get('/', (req, res) => {
  console.log('🏠 GET /');

  res.status(200).send('Server is running');
});


// =====================================================
// 🐛 DEBUG ROUTE
// =====================================================

app.all('/api/debug', (req, res) => {
  console.log('🐛 DEBUG ROUTE');

  res.json({
    ok: true,
    method: req.method,
    url: req.originalUrl,
    headers: {
      host: req.headers.host,
      userAgent: req.headers['user-agent'],
      inngestSignature: req.headers['x-inngest-signature']
        ? 'EXISTS'
        : 'MISSING',
      inngestSdk: req.headers['x-inngest-sdk'] || null,
      inngestServerKind:
        req.headers['x-inngest-server-kind'] || null,
      inngestEnvironment:
        req.headers['x-inngest-environment'] || null,
    },
    environment: {
      signingKey: !!process.env.INNGEST_SIGNING_KEY,
      eventKey: !!process.env.INNGEST_EVENT_KEY,
    },
  });
});


// =====================================================
// 🔑 ENVIRONMENT CHECK
// =====================================================

console.log('\n========================================');
console.log('🔥 ENVIRONMENT CHECK');
console.log('========================================');

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

console.log(
  'CLERK_SECRET_KEY:',
  process.env.CLERK_SECRET_KEY
    ? '✅ EXISTS'
    : '❌ MISSING'
);

console.log('========================================\n');


// =====================================================
// 🚀 SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log('========================================');
});