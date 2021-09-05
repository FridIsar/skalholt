import {
  test,
  describe,
  expect,
} from '@jest/globals';

import { fetchAndParse } from './utils.js';

describe('summarized finds', () => {
  test('GET /years/1670/buildings/1', async () => {
    const { result } = await fetchAndParse('/years/1670/buildings/1');

    expect(result.finds.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /years/1670/buildings/12/finds', async () => {
    const { result } = await fetchAndParse('/years/1670/buildings/12/finds');

    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
