import { test, describe, expect } from '@jest/globals';

import {
  deleteAndParse,
  loginAsHardcodedAdminAndReturnToken,
  createRandomUserAndReturnWithToken,
  patchAndParse,
  postAndParse,
  getRandomInt,
  randomValue,
} from './utils.js';

describe('years admin', () => {
  test('POST /years requires admin', async () => {
    const { status } = await postAndParse('/years');

    expect(status).toBe(401);
  });

  const storedYear = getRandomInt(2000, 3000);

  test('POST /years valid req data', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const year = storedYear;

    const data = {
      year,
    };
    const { result, status } = await postAndParse('/years', data, token, './test.svg');

    expect(status).toBe(201);
    expect(result.year).toBe(year);
    expect(result.image).toBeTruthy();
  });

  test('POST /years requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await postAndParse('/years', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /years/:yearId requires admin', async () => {
    const { status } = await deleteAndParse('/years/9999');

    expect(status).toBe(401);
  });

  test('DELETE /years/:yearId requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await deleteAndParse('/years/9999', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /years/:yearId success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const year = getRandomInt(3000, 4000);
    const data = {
      year,
    };
    const { result, status } = await postAndParse('/years', data, token, './test.svg');

    expect(status).toBe(201);
    expect(result.year).toBe(year);
    expect(result.image).toBeTruthy();

    const {
      result: deleteResult, status: deleteStatus,
    } = await deleteAndParse(`/years/${year}`, null, token);

    expect(deleteStatus).toBe(200);
    expect(deleteResult).toEqual({});
  });

  test('PATCH /years/:yearId, invalid data', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = null;

    const { result, status } = await patchAndParse('/years/1670', data, token);

    expect(status).toBe(400);
    expect(result.error).toBe('Nothing to update');
  });

  test('PATCH /years/:yearId, year', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const description = randomValue();
    const data = { description };

    const { result, status } = await patchAndParse(`/years/${storedYear}`, data, token);

    expect(status).toBe(200);
    expect(result.description).toBe(description);
  });
});
