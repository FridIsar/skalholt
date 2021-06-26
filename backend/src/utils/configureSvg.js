import path from 'path';
import { fileURLToPath } from 'url';
import { optimize } from 'svgo';

import { writeFile, readFile, exists } from './fileSystem.js';
import { logger } from './logger.js';

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
  const currPath = path.dirname(fileURLToPath(import.meta.url));
  let tempPath = `../../temp/${svg}`;
  const svgExists = await exists(path.join(currPath, tempPath));

  if (svgExists) {
    try {
      tempPath = path.join(currPath, tempPath);

      const data = await readFile(tempPath);
      const result = optimize(data, { path: tempPath, ...config });

      const newPath = type.includes('/years') ? `../../data/svg/years/${id}.svg` : `../../data/svg/buildings/${id}.svg`;
      await writeFile(path.join(currPath, newPath), result.data);

      return `${type}${id}.svg`;
    } catch (err) {
      logger.error('Error optimizing svg:', err);
    }
  }

  return null;
}
