// TODO: Test POST and PATCH routes with more variables
import { test, describe, expect } from '@jest/globals';

import {
  createRandomUserAndReturnWithToken,
  deleteAndParse,
  loginAsHardcodedAdminAndReturnToken,
  postAndParse,
  patchAndParse,
  randomValue,
} from './utils.js';

describe('buildings admin', () => {
  test('POST /years/:yearId/buildings requires admin', async () => {
    const { status } = await postAndParse('/years/1670/buildings');

    expect(status).toBe(401);
  });

  test('POST /years/:yearId/buildings requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await postAndParse('/years/1670/buildings', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('POST /years/:yearId/buildings w/admin invalid year', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = {};
    const { result, status } = await postAndParse('/years/mistake/buildings', data, token);

    expect(status).toBe(400);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  test('POST /years/:yearId/buildings minimum valid request data', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const rnd = randomValue();

    const data = {
      phase: rnd,
      start: '1670',
      end: '1680',
    };

    const { result, status } = await postAndParse('/years/1670/buildings', data, token);

    expect(status).toBe(201);
    expect(result.phase).toBe(rnd);
  });

  test('POST /years/:yearId/buildings/ valid request data with image', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const rnd = randomValue();

    const data = {
      phase: rnd,
      start: '1680',
      end: '1690',
    };

    const { result, status } = await postAndParse('/years/1680/buildings', data, token, './test.svg');

    expect(status).toBe(201);
    expect(result.phase).toBe(rnd);
    expect(result.start).toBe(1680);
    expect(result.end).toBe(1690);
    expect(result.image).toBeTruthy();
  });

  test('POST /years/:yearId/buildings/ valid request data with inaccurate years', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const rnd = randomValue();

    const data = {
      phase: rnd,
      start: '1695',
      end: '1696',
    };

    const { result, status } = await postAndParse('/years/1690/buildings', data, token);

    expect(status).toBe(201);
    expect(result.phase).toBe(rnd);
    expect(result.start).toBe(1690);
    expect(result.end).toBe(1700);
  });

  test('DELETE /years/:yearId/buildings/ requires admin', async () => {
    const { status } = await deleteAndParse('/years/9999/buildings/9999');

    expect(status).toBe(401);
  });

  test('DELETE /years/:yearId/buildings/ requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await deleteAndParse('/years/9999/buildings/9999', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /years/:yearId/buildings/:buildingId success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const rnd = randomValue();

    const data = {
      phase: rnd,
      start: '1710',
      end: '1750',
    };

    const { result, status } = await postAndParse('/years/1710/buildings', data, token);

    expect(status).toBe(201);
    expect(result.phase).toBe(rnd);

    const { id } = result;
    const {
      result: deleteResult, status: deleteStatus,
    } = await deleteAndParse(`/years/1710/buildings/${id}`, null, token);

    expect(deleteStatus).toBe(200);
    expect(deleteResult).toEqual({});
  });

  test('PATCH /years/:yearId/buildings/:buildingId invalid data', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = null;

    const { result, status } = await patchAndParse('/years/1670/buildings/1', data, token);

    expect(status).toBe(400);
    expect(result.error).toBe('Nothing to update');
  });

  test('PATCH /years/:yearId/buildings/:buildingId, year', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const description = randomValue();
    const data = { description };

    const { result, status } = await patchAndParse('/years/1720/buildings/32', data, token);

    expect(status).toBe(200);
    expect(result.description).toBe(description);
  });
});
