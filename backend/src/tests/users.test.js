import { test, describe, expect } from '@jest/globals';
import dotenv from 'dotenv';

import {
  fetchAndParse, loginAndReturnToken, patchAndParse, postAndParse, randomValue,
} from './utils.js';
import requireEnv from '../utils/requireEnv.js';

dotenv.config();
requireEnv(['TOKEN_LIFETIME']);

const {
  TOKEN_LIFETIME: expiresIn = '3600',
} = process.env;

describe('users', () => {
  // Random username for all the following tests, highly unlikely we'll create
  // the same user twice
  const rnd = randomValue();
  const username = `user${rnd}`;
  const email = `user${rnd}@bla.bla`;
  const password = '1234567890';

  test('Create user, missing data', async () => {
    const data = null;
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(4);
  });

  test('Create user, missing email & password', async () => {
    const data = { username };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(3);
  });

  test('Create user, username too long', async () => {
    const data = { username: 'x'.repeat(257), password, email };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toEqual('username is required, max 256 characters');
  });

  test('Create user, too short password', async () => {
    const data = { username, password: '123', email };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toEqual('password is required, min 10 characters, max 256 characters');
  });

  test('Create user, invalid email', async () => {
    const data = { username, password, email: '123' };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toEqual('email is required, max 256 characters');
  });

  test('Create user, success', async () => {
    const data = { username, password, email };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(201);
    expect(result.username).toBe(username);
    expect(result.email).toBe(email);
    expect(result.password).toBeUndefined();
  });

  test('Create user, exists', async () => {
    const data = { username, password, email };
    const { result, status } = await postAndParse('/users/register', data);

    // Assumes tests run in order
    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toEqual('username already exists');
  });

  test('Login user, no data', async () => {
    const data = null;
    const { result, status } = await postAndParse('/users/login', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(2);
  });

  test('Login user, username & no pass', async () => {
    const data = { username: 'foobar' };
    const { result, status } = await postAndParse('/users/login', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toBe('password is required, min 10 characters, max 256 characters');
  });

  test('Login user, invalid username & pass', async () => {
    const data = { username: 'foobar', password: 'x'.repeat(10) };
    const { result, status } = await postAndParse('/users/login', data);

    expect(status).toBe(401);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toBe('username or password incorrect');
  });

  test('Login user, success', async () => {
    const data = { username, password };
    const { result, status } = await postAndParse('/users/login', data);

    expect(status).toBe(200);
    expect(result.expiresIn).toBe(parseInt(expiresIn, 10));
    expect(result.token.length).toBeGreaterThanOrEqual(20); // 20 is random
    expect(result.user.admin).toBe(false);
    expect(result.user.email).toBe(email);
    expect(result.user.username).toBe(username);
    expect(result.user.password).toBeUndefined();
  });

  test('Logged in user data on /users/me', async () => {
    const token = await loginAndReturnToken({ username, password });
    expect(token).toBeTruthy();

    const { result, status } = await fetchAndParse('/users/me', token);

    expect(status).toBe(200);
    expect(result.admin).toBe(false);
    expect(result.email).toBe(email);
    expect(result.username).toBe(username);
    expect(result.password).toBeUndefined();
  });

  test('patch /users/me, invalid data', async () => {
    const token = await loginAndReturnToken({ username, password });
    expect(token).toBeTruthy();

    const data = null;

    const { result, status } = await patchAndParse('/users/me', data, token);

    expect(status).toBe(400);
    expect(result.errors[0].msg).toBe('require at least one value of: email, password');
  });

  test('patch /users/me, invalid email', async () => {
    const token = await loginAndReturnToken({ username, password });
    expect(token).toBeTruthy();

    const data = { email: 'x' };

    const { result, status } = await patchAndParse('/users/me', data, token);

    expect(status).toBe(400);
    expect(result.errors[0].msg).toBe('email is required, max 256 characters');
  });

  test('patch /users/me, invalid password', async () => {
    const token = await loginAndReturnToken({ username, password });
    expect(token).toBeTruthy();

    const data = { password: 'x' };

    const { result, status } = await patchAndParse('/users/me', data, token);

    expect(status).toBe(400);
    expect(result.errors[0].msg).toBe('password is required, min 10 characters, max 256 characters');
  });

  test('patch /users/me, valid data', async () => {
    const token = await loginAndReturnToken({ username, password });
    expect(token).toBeTruthy();

    const newEmail = `newemail${randomValue()}@example.org`;
    const newPassword = 'x'.repeat(10);
    const data = { email: newEmail, password: newPassword };

    const { result, status } = await patchAndParse('/users/me', data, token);

    expect(status).toBe(200);
    expect(result.admin).toBe(false);
    expect(result.email).toBe(newEmail);
    expect(result.username).toBe(username);
    expect(result.password).toBeUndefined();

    // so we don't loose the newEmail, also test logging in

    // old password shouldn't work
    const nullToken = await loginAndReturnToken({ username, password });
    expect(nullToken).toBeNull();

    // but new password should work
    const newToken = await loginAndReturnToken({ username, password: newPassword });
    expect(newToken).toBeTruthy();

    const { result: newResult, status: newStatus } = await fetchAndParse('/users/me', newToken);

    expect(newStatus).toBe(200);
    expect(newResult.admin).toBe(false);
    expect(newResult.email).toBe(newEmail);
    expect(newResult.username).toBe(username);
    expect(newResult.password).toBeUndefined();
  });

  test('Create user that already exists (admin)', async () => {
    const data = { username: 'admin', password: 'x'.repeat(10), email: 'admin@example.org' };
    const { result, status } = await postAndParse('/users/register', data);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].msg).toEqual('username already exists');
  });
});
