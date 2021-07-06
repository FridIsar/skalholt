import { test, describe, expect } from '@jest/globals';

import {
  createRandomUserAndReturnWithToken,
  fetchAndParse,
  loginAsHardcodedAdminAndReturnToken,
  patchAndParse,
} from './utils.js';

describe('users admin', () => {
  test('GET /users requires auth', async () => {
    const { status } = await fetchAndParse('/users');

    expect(status).toBe(401);
  });

  test('GET /users requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await fetchAndParse('/users', token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('GET /users requires admin, success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const { result, status } = await fetchAndParse('/users', token);

    expect(status).toBe(200);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /users/1 requires admin, success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const { result, status } = await fetchAndParse('/users/1', token);

    expect(status).toBe(200);
    expect(result.id).toBe(1);
    expect(result.username).toBeDefined();
  });

  test('GET /users/9999 requires admin, returns 404', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const { status } = await fetchAndParse('/users/9999', token);

    expect(status).toBe(404);
  });

  test('PATCH /users/999 is 404', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = null;
    const { status } = await patchAndParse('/users/999', data, token);

    expect(status).toBe(404);
  });

  test('PATCH /users/1 without admin is 400', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = null;
    const { result, status } = await patchAndParse('/users/1', data, token);

    expect(status).toBe(400);
    expect(result.errors.length).toBe(2);
  });

  test('PATCH /users/1 with admin is 400 since cannot change self', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = { admin: false };
    const { result, status } = await patchAndParse('/users/1', data, token);

    expect(status).toBe(400);
    expect(result.errors[0].msg).toBe('admin cannot change self');
  });

  test('PATCH newly created user is success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const { user } = await createRandomUserAndReturnWithToken();
    expect(user).toBeTruthy();
    expect(user.admin).toBe(false);

    const data = { admin: true };
    const { result, status } = await patchAndParse(`/users/${user.id}`, data, token);

    expect(status).toBe(200);
    expect(result.admin).toBe(true);
  });
});
