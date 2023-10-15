// The initialization point or main function of the backend API
//
// Binds to a port and defines the routing service and user validation service to be used
// The document also defines the cross origin header settings

import fs from 'fs';
import path from 'path';
import https from 'https';
import express from 'express';
import dotenv from 'dotenv';

import { router as apiRouter } from './api/index.js';
import { router as authRouter } from './auth/api.js';
import passport from './auth/passport.js';
import requireEnv from './utils/requireEnv.js';

dotenv.config();
requireEnv(['DATABASE_URL', 'JWT_SECRET']);

// Port initialization, change in .env not here

const {
  PORT: port = 3000,
SSL_KEY_PATH: sslKeyPath,
  SSL_CERT_PATH: sslCertPath,
} = process.env;

const app = express();

app.use(express.json());
app.use(passport.initialize());

/**
 * In general we define that form-data or json communications
 * are to be used when talking to the backend
 */
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PATCH') {
    if (
      req.headers['content-type']
      && (
        req.headers['content-type'] !== 'application/json'
        && !req.headers['content-type'].startsWith('multipart/form-data;')
      )) {
      return res.status(400).json({ error: 'body must be json or form-data' });
    }
  }
  return next();
});

/**
 * CORS policy definitions, Allow-Origin * should be changed to the IP of the front end on prod
 */
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
app.use(authRouter);
app.use('/api', apiRouter); // added prefix for deployment

// Generic error catchers if a specific error was not thrown

app.use((req, res, next) => { // eslint-disable-line
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => { // eslint-disable-line
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  return res.status(500).json({ error: 'Internal server error' });
});

// Initialization statement
//HTTP
//app.listen(port, () => {
 // console.info(`Server running at http://localhost:${port}/`);
//});
//HTTPS
// Load SSL certificates
const options = {
  key: fs.readFileSync(path.resolve(sslKeyPath)),
  cert: fs.readFileSync(path.resolve(sslCertPath)),
};

// Create HTTPS server
const httpsServer = https.createServer(options, app);

// Listen for HTTPS requests
httpsServer.listen(port, () => {
  console.info(`Server running at https://localhost:${port}/`);
});
