import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { optimize } from 'svgo';

import { writeFile, readFile } from './fileSystem.js';
import { logger } from './logger.js';

import requireEnv from './requireEnv.js';

dotenv.config();
requireEnv(['MULTER_TEMP_DIR']);

// The optimizations to undertake
// These can be changed as needed
const config = {
  plugins: [
    'removeStyleElement',
    'removeTitle',
    'removeDesc',
    'removeUselessDefs',
    'removeDimensions',
    'removeRasterImages',
    'collapseGroups',
    'cleanupIDs',
    'removeEmptyContainers',
    'removeEmptyAttrs',
    'cleanupAttrs',
    { name: 'removeAttrs', params: { attrs: '(stroke|fill)' } },
  ],
};

/**
 * Function to optimize a svg and store it according to type
 * building/year
 *
 * @param {string} svg the path to the unoptimized image
 * @param {number} id the id of the year or building to apply to the new image path
 * @param {string} type whether this svg is for a building or year
 * @returns the name of the new optimized svg
 */
export default async function configureSvg(svg, id, type) {
  if (svg) {
    try {
      const data = await readFile(svg);
      const result = optimize(data, { path: svg, ...config });

      const newPath = type.includes('/buildings') ? `../../data/svg/buildings/${id}.svg` : `../../data/svg/years/${id}.svg`;

      const currPath = path.dirname(fileURLToPath(import.meta.url));
      await writeFile(path.join(currPath, newPath), result.data);

      return `${type}${id}.svg`;
    } catch (err) {
      logger.error('Error optimizing svg:', err);
    }
  }

  return null;
}
