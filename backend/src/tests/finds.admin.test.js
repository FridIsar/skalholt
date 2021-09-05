import { test, describe, expect } from '@jest/globals';

import {
  createRandomUserAndReturnWithToken,
  deleteAndParse,
  loginAsHardcodedAdminAndReturnToken,
  postAndParse,
  patchAndParse,
  randomValue,
} from './utils.js';

describe('finds admin', () => {
  test('POST /years/:yearId/buildings/:buildingId/finds requires admin', async () => {
    const { status } = await postAndParse('/years/1670/buildings/12/finds');

    expect(status).toBe(401);
  });

  test('POST /years/:yearId/buildings/:buildingId/finds requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await postAndParse('/years/1670/buildings/12/finds', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('POST /years/:yearId/buildings/:buildingId/finds minimum valid request data', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = { };
    const { status } = await postAndParse('/years/1670/buildings/12/finds/', data, token);

    expect(status).toBe(201);
  });

  test('DELETE /years/:yearId/buildings/:buildingId/finds requires admin', async () => {
    const { status } = await deleteAndParse('/years/9999/buildings/9999/finds/9999');

    expect(status).toBe(401);
  });

  test('DELETE /years/:yearId/buildings/:buildingId/finds requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await deleteAndParse('/years/9999/buildings/9999/finds/9999', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /years/:yearId/buildings/:buildingId/features/:findId success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const rnd = randomValue();

    const data = {
      obj_type: rnd,
    };

    const { result, status } = await postAndParse('/years/1720/buildings/1/finds/', data, token);

    expect(status).toBe(201);
    expect(result.obj_type).toBe(rnd);

    const { id } = result;
    const {
      result: deleteResult, status: deleteStatus,
    } = await deleteAndParse(`/years/1720/buildings/1/finds/${id}`, null, token);

    expect(deleteStatus).toBe(200);
    expect(deleteResult).toEqual({});
  });

  test('PATCH /years/:yearId/buildings/:buildingId/finds/:findId, obj_type', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const obj_type = 'blabla'; // eslint-disable-line
    const data = { obj_type };

    const { result, status } = await patchAndParse('/years/1720/buildings/32/finds/1744', data, token);

    expect(status).toBe(200);
    expect(result.obj_type).toBe(obj_type);
  });
});
