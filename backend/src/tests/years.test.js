import { test, describe, expect } from '@jest/globals';

import { fetchAndParse } from './utils.js';

describe('years', () => {
  test('GET /years', async () => {
    const { result } = await fetchAndParse('/years');

    expect(result.length).toBeGreaterThanOrEqual(30);
  });

  test('GET /years/1670 does exist', async () => {
    const { result, status } = await fetchAndParse('/years/1670');

    expect(status).toBe(200);
    expect(result.year).toBe(1670);
    expect(result.image).toBe('/years/1670.svg');
  });

  test('GET /years/2010 does not exist', async () => {
    const { status } = await fetchAndParse('/years/2010');

    expect(status).toBe(404);
  });
});
