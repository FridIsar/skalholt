import {
  test,
  describe,
  expect,
} from '@jest/globals';

import { fetchAndParse } from './utils.js';

describe('files', () => {
  test('GET /files', async () => {
    const { result } = await fetchAndParse('/years');

    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /files/1 does exist', async () => {
    const { status } = await fetchAndParse('/files/1');

    expect(status).toBe(200);
  });

  test('GET /files/9999 does not exist', async () => {
    const { status } = await fetchAndParse('/files/9999');

    expect(status).toBe(404);
  });
});
