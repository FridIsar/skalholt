import { test, describe, expect } from '@jest/globals';

import {
  deleteAndParse,
  loginAsHardcodedAdminAndReturnToken,
  createRandomUserAndReturnWithToken,
  postAndParse,
} from './utils.js';

describe('csv admin', () => {
  test('POST /csv requires admin', async () => {
    const { status } = await postAndParse('/csv');

    expect(status).toBe(401);
  });

  test('POST /csv valid file', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const { status } = await postAndParse('/csv', null, token, null, './atestfile.csv');

    expect(status).toBe(201);
  });

  test('POST /csv requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await postAndParse('/csv', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /csv/:csvId requires admin', async () => {
    const { status } = await deleteAndParse('/csv/9999');

    expect(status).toBe(401);
  });

  test('DELETE /csv/:csvId requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await deleteAndParse('/csv/9999', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /csv/:csvId success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const { result, status } = await postAndParse('/csv', null, token, null, './adifferenttestfile.csv');

    expect(status).toBe(201);

    const {
      result: deleteResult, status: deleteStatus,
    } = await deleteAndParse(`/csv/${result.id}`, null, token);

    expect(deleteStatus).toBe(200);
    expect(deleteResult).toEqual({});
  });
});
