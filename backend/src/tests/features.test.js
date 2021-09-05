import {
  test,
  describe,
  expect,
} from '@jest/globals';

import { fetchAndParse } from './utils.js';

describe('summarized features', () => {
  test('GET /years/1670/buildings/1', async () => {
    const { result } = await fetchAndParse('/years/1670/buildings/1');

    expect(result.features.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /years/1670/buildings/12/features', async () => {
    const { result } = await fetchAndParse('/years/1670/buildings/12/features');

    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
