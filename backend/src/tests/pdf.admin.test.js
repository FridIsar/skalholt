import { test, describe, expect } from '@jest/globals';

import {
  deleteAndParse,
  loginAsHardcodedAdminAndReturnToken,
  createRandomUserAndReturnWithToken,
  postAndParse,
} from './utils.js';

describe('pdf admin', () => {
  test('POST /pdf requires admin', async () => {
    const { status } = await postAndParse('/pdf');

    expect(status).toBe(401);
  });

  test('POST /pdf valid file', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = {
      tag: 'bla.pdf',
      major_group: 'archival data',
    };

    const { status } = await postAndParse('/pdf', data, token, null, './test.pdf');

    expect(status).toBe(201);
  });

  test('POST /pdf requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await postAndParse('/pdf', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /pdf/:pdfId requires admin', async () => {
    const { status } = await deleteAndParse('/pdf/9999');

    expect(status).toBe(401);
  });

  test('DELETE /pdf/:pdfId requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await deleteAndParse('/pdf/9999', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /pdf/:pdfId success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = {
      tag: 'bla2.pdf',
      major_group: 'archival data',
    };

    const { result, status } = await postAndParse('/pdf', data, token, null, './test.pdf');

    expect(status).toBe(201);

    const {
      result: deleteResult, status: deleteStatus,
    } = await deleteAndParse(`/pdf/${result.id}`, null, token);

    expect(deleteStatus).toBe(200);
    expect(deleteResult).toEqual({});
  });
});
