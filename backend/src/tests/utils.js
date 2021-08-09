import fs from 'fs';
import crypto from 'crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';

import { stat } from '../utils/fileSystem.js';

const basePath = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const {
  BASE_URL = 'http://localhost:3000',
  ADMIN_USER: adminUser = '',
  ADMIN_PASS: adminPass = '',
} = process.env;

export const baseUrl = BASE_URL;

export function randomValue() {
  return crypto.randomBytes(16).toString('hex');
}

export function getRandomInt(min, max) {
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - ceilMin) + ceilMin);
}

export async function methodAndParse(
  method,
  path,
  data = null,
  token = null,
  imagePath = null,
  filePath = null,
) {
  const url = new URL(path, baseUrl);

  const options = { headers: {} };

  if (method !== 'GET') {
    options.method = method;
  }

  if (imagePath) {
    const resolvedImagePath = join(basePath, imagePath);
    const form = new FormData();
    const stats = stat(resolvedImagePath);
    const fileSizeInBytes = stats.size;
    const fileStream = fs.createReadStream(resolvedImagePath);
    form.append('image', fileStream, { knownLength: fileSizeInBytes });

    if (data) {
      for (const [key, value] of Object.entries(data)) {
        form.append(key, value);
      }
    }
    options.body = form;
  } else if (filePath) {
    const resolvedFilePath = join(basePath, filePath);
    const form = new FormData();
    const stats = stat(resolvedFilePath);
    const fileSizeInBytes = stats.size;
    const fileStream = fs.createReadStream(resolvedFilePath);
    form.append('file', fileStream, { knownLength: fileSizeInBytes });

    if (data) {
      for (const [key, value] of Object.entries(data)) {
        form.append(key, value);
      }
    }
    options.body = form;
  } else if (data) {
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(data);
  }

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  const result = await fetch(url, options);

  let json = null;

  // These paths only return statuses and SVG / CSV objects, no JSON
  if (!(path.includes('.svg') || (path.includes('files') && method === 'GET'))) {
    json = await result.json();
  }

  return {
    result: json,
    status: result.status,
  };
}

export async function fetchAndParse(path, token = null) {
  return methodAndParse('GET', path, null, token);
}

export async function postAndParse(path, data, token = null, imagePath = null, filePath = null) {
  return methodAndParse('POST', path, data, token, imagePath, filePath);
}

export async function patchAndParse(path, data, token = null, imagePath = null, filePath = null) {
  return methodAndParse('PATCH', path, data, token, imagePath, filePath);
}

export async function deleteAndParse(path, data, token = null) {
  return methodAndParse('DELETE', path, data, token);
}

export async function loginAndReturnToken(data) {
  const { result } = await postAndParse('/users/login', data);

  if (result && result.token) {
    return result.token;
  }

  return null;
}

export async function createRandomUserAndReturnWithToken() {
  const rnd = randomValue();
  const username = `user${rnd}`;
  const email = `user${rnd}@example.org`;
  const password = '1234567890';

  const data = { username, password, email };
  const { result } = await postAndParse('/users/register', data);
  const token = await loginAndReturnToken({ username, password });

  return {
    user: result,
    token,
  };
}

export async function loginAsHardcodedAdminAndReturnToken() {
  const token = await loginAndReturnToken({ username: adminUser, password: adminPass });
  return token;
}
