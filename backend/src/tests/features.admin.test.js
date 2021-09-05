import { test, describe, expect } from '@jest/globals';

import {
  createRandomUserAndReturnWithToken,
  deleteAndParse,
  loginAsHardcodedAdminAndReturnToken,
  postAndParse,
  patchAndParse,
  randomValue,
} from './utils.js';

describe('features admin', () => {
  test('POST /years/:yearId/buildings/:buildingId/features requires admin', async () => {
    const { status } = await postAndParse('/years/1670/buildings/12/features');

    expect(status).toBe(401);
  });

  test('POST /years/:yearId/buildings/:buildingId/features requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await postAndParse('/years/1670/buildings/12/features', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('POST /years/:yearId/buildings/:buildingId/features minimum valid request data', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = { };
    const { status } = await postAndParse('/years/1670/buildings/12/features/', data, token);

    expect(status).toBe(201);
  });

  test('DELETE /years/:yearId/buildings/:buildingId/features requires admin', async () => {
    const { status } = await deleteAndParse('/years/9999/buildings/9999/features/9999');

    expect(status).toBe(401);
  });

  test('DELETE /years/:yearId/buildings/:buildingId/features requires admin, not user', async () => {
    const { token } = await createRandomUserAndReturnWithToken();
    expect(token).toBeTruthy();

    const { result, status } = await deleteAndParse('/years/9999/buildings/9999/features/9999', null, token);

    expect(status).toBe(401);
    expect(result.error).toBe('insufficient authorization');
  });

  test('DELETE /years/:yearId/buildings/:buildingId/features/:featureId success', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const rnd = randomValue();

    const data = {
      type: rnd,
    };

    const { result, status } = await postAndParse('/years/1720/buildings/1/features/', data, token);

    expect(status).toBe(201);
    expect(result.type).toBe(rnd);

    const { id } = result;
    const {
      result: deleteResult, status: deleteStatus,
    } = await deleteAndParse(`/years/1720/buildings/1/features/${id}`, null, token);

    expect(deleteStatus).toBe(200);
    expect(deleteResult).toEqual({});
  });

  test('PATCH /years/:yearId/buildings/:buildingId/features/:featureId, description', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const description = randomValue();
    const data = { description };

    const { result, status } = await patchAndParse('/years/1720/buildings/32/features/1098', data, token);

    expect(status).toBe(200);
    expect(result.description).toBe(description);
  });
});
