import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import { clerkMiddleware } from '@clerk/express'; // import the clerk middleware

import { serve } from 'inngest/express'; // import the Inngest express handler
import { inngest, functions } from './inngest/index.js'; // import the Inngest client and functions

const app = express(); // making an app

app.use(express.json());   // to parse incoming JSON requests
app.use(cors());       // to allow cross-origin requests
app.use(clerkMiddleware()); // use the clerk middleware

app.get('/', (req, res) => { res.send("Server is running") });   // test route

app.use('/api/inngest' , serve({ client: inngest, functions })); // route to handle Inngest events

const PORT = process.env.PORT || 5000;    // set the port to listen on

app.listen(PORT, () => { // start the server
    console.log(`Server is running on port ${PORT}`);
});