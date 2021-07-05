import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { router as apiRouter } from './api/index.js';
import { router as authRouter } from './auth/api.js';
import passport from './auth/passport.js';
// import { cors } from './utils/cors.js';
import requireEnv from './utils/requireEnv.js';

dotenv.config();
requireEnv(['DATABASE_URL', 'JWT_SECRET']);

const {
  PORT: port = 3000,
} = process.env;

const app = express();

app.use(express.json());
app.use(passport.initialize());

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

// app.use(cors);
app.use(cors());
app.use(authRouter);
app.use(apiRouter);

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

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
