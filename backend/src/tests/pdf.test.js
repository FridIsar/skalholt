import {
  test,
  describe,
  expect,
} from '@jest/globals';

import { fetchAndParse } from './utils.js';

describe('pdf', () => {
  test('GET /pdf', async () => {
    const { result } = await fetchAndParse('/pdf');

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /pdf/1 does exist', async () => {
    const { status } = await fetchAndParse('/pdf/1');

    expect(status).toBe(200);
  });

  test('GET /pdf/9999 does not exist', async () => {
    const { status } = await fetchAndParse('/pdf/9999');

    expect(status).toBe(404);
  });
});
