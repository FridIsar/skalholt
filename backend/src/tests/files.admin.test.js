import { test, describe, expect } from '@jest/globals';

import {
  deleteAndParse,
  loginAsHardcodedAdminAndReturnToken,
  createRandomUserAndReturnWithToken,
  patchAndParse,
  postAndParse,
} from './utils.js';

describe('files admin', () => {
  test('POST /files requires admin', async () => {
    const { status } = await postAndParse('/files');

    expect(status).toBe(401);
  });

  test('POST /files valid file', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const { status } = await postAndParse('/files', null, token, null, './atestfile.csv');

    expect(status).toBe(201);
  });

  test('POST /files requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await postAndParse('/files', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /files/:fileId requires admin', async () => {
    const { status } = await deleteAndParse('/files/9999');

    expect(status).toBe(401);
  });

  test('DELETE /files/:fileId requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await deleteAndParse('/files/9999', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /files/:fileId success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const { result, status } = await postAndParse('/files', null, token, null, './adifferenttestfile.csv');

    expect(status).toBe(201);

    const {
      result: deleteResult, status: deleteStatus,
    } = await deleteAndParse(`/files/${result.id}`, null, token);

    expect(deleteStatus).toBe(200);
    expect(deleteResult).toEqual({});
  });

  test('PATCH /files/:fileId, invalid data', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = null;

    const { status } = await patchAndParse('/files/1', data, token);

    expect(status).toBe(400);
  });
});
