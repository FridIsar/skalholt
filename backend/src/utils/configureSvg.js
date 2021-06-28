import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { optimize } from 'svgo';

import { writeFile, readFile, removeDir } from './fileSystem.js';
import { logger } from './logger.js';

import requireEnv from './requireEnv.js';

dotenv.config();
requireEnv(['MULTER_TEMP_DIR']);

const {
  MULTER_TEMP_DIR: multerDir = './temp',
} = process.env;

const config = {
  plugins: [
    'cleanupAttrs',
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeUselessDefs',
    'removeEditorsNSData',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeEmptyText',
    'removeEmptyContainers',
    // 'removeViewBox',
    'cleanupEnableBackground',
    'convertStyleToAttrs',
    'convertColors',
    'convertPathData',
    'convertTransform',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'removeUnusedNS',
    'cleanupIDs',
    'cleanupNumericValues',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    // 'removeRasterImages',
    'mergePaths',
    'convertShapeToPath',
    'sortAttrs',
    'removeDimensions',
    { name: 'removeAttrs', params: { attrs: '(stroke|fill)' } },
  ],
};

export default async function configureSvg(svg, id, type) {
  if (svg) {
    try {
      const data = await readFile(svg);
      const result = optimize(data, { path: svg, ...config });

      const newPath = type.includes('/buildings') ? `../../data/svg/buildings/${id}.svg` : `../../data/svg/years/${id}.svg`;

      const currPath = path.dirname(fileURLToPath(import.meta.url));
      await writeFile(path.join(currPath, newPath), result.data);

      removeDir(multerDir);

      return `${type}${id}.svg`;
    } catch (err) {
      logger.error('Error optimizing svg:', err);
    }
  }

  return null;
}
