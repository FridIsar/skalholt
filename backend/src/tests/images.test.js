import {
  test,
  describe,
  expect,
} from '@jest/globals';

import { fetchAndParse } from './utils.js';

describe('images', () => {
  test('GET /images', async () => {
    const { result } = await fetchAndParse('/images');

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /images/1 does exist', async () => {
    const { status } = await fetchAndParse('/images/1');

    expect(status).toBe(200);
  });

  test('GET /images/9999 does not exist', async () => {
    const { status } = await fetchAndParse('/images/9999');

    expect(status).toBe(404);
  });
});
