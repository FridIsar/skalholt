import {
  test,
  describe,
  expect,
} from '@jest/globals';

import { fetchAndParse } from './utils.js';

describe('csv', () => {
  test('GET /csv', async () => {
    const { result } = await fetchAndParse('/csv');

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /csv/1 does exist', async () => {
    const { status } = await fetchAndParse('/csv/1');

    expect(status).toBe(200);
  });

  test('GET /csv/9999 does not exist', async () => {
    const { status } = await fetchAndParse('/csv/9999');

    expect(status).toBe(404);
  });
});
