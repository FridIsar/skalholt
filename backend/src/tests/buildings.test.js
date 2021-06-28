// TODO: Add tests for svg route when more data is available
import {
  test,
  describe,
  expect,
} from '@jest/globals';

import { fetchAndParse } from './utils.js';

describe('buildings', () => {
  test('GET /years/1670/buildings', async () => {
    const { result } = await fetchAndParse('/years/1670/buildings');

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /years/9999/buildings does not exist', async () => {
    const { status } = await fetchAndParse('/years/9999/buildings');

    expect(status).toBe(404);
  });

  test('GET /years/1670/buildings/1 does exist', async () => {
    const { result, status } = await fetchAndParse('/years/1670/buildings/1');

    expect(status).toBe(200);
    expect(result.id).toBe(1);
  });

  test('GET /years/1670/buildings/9999 does not exist', async () => {
    const { status } = await fetchAndParse('/years/1670/buildings/9999');

    expect(status).toBe(404);
  });
});
