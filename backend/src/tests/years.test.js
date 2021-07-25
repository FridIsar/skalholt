import {
  test,
  describe,
  expect,
} from '@jest/globals';

import { fetchAndParse } from './utils.js';

describe('years', () => {
  test('GET /years', async () => {
    const { result } = await fetchAndParse('/years');

    expect(result.length).toBeGreaterThanOrEqual(29);
  });

  test('GET /years/1670.svg does exist', async () => {
    const { status } = await fetchAndParse('/years/1670.svg');

    expect(status).toBe(200);
  });

  test('GET /years/9999.svg does not exist', async () => {
    const { status } = await fetchAndParse('/years/9999.svg');

    expect(status).toBe(404);
  });
});
