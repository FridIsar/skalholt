import { test, describe, expect } from '@jest/globals';

import {
  deleteAndParse,
  loginAsHardcodedAdminAndReturnToken,
  createRandomUserAndReturnWithToken,
  postAndParse,
} from './utils.js';

describe('images admin', () => {
  test('POST /images requires admin', async () => {
    const { status } = await postAndParse('/images');

    expect(status).toBe(401);
  });

  test('POST /images valid file', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = {
      tag: 'bla.png',
      major_group: 'archival data',
    };

    const { status } = await postAndParse('/images', data, token, './test.png');

    expect(status).toBe(201);
  });

  test('POST /images requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await postAndParse('/images', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /images/:imagesId requires admin', async () => {
    const { status } = await deleteAndParse('/images/9999');

    expect(status).toBe(401);
  });

  test('DELETE /images/:imagesId requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await deleteAndParse('/images/9999', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /images/:imagesId success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = {
      tag: 'bla2.png',
      major_group: 'archival data',
    };

    const { result, status } = await postAndParse('/images', data, token, './test.png');

    expect(status).toBe(201);

    const {
      result: deleteResult, status: deleteStatus,
    } = await deleteAndParse(`/images/${result.id}`, null, token);

    expect(deleteStatus).toBe(200);
    expect(deleteResult).toEqual({});
  });
});
