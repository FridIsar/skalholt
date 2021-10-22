import path from 'path';
import { fileURLToPath } from 'url';

// import { logger } from '../utils/logger.js';
import {
  exists,
} from '../utils/fileSystem.js';
import {
  query,
  singleQuery,
} from '../db.js';

/**
 * Routing function used for GET on /images
 *
 * @param {Object} _req request object ( Not used )
 * @param {Object} res  response object
 * @returns JSON response with the info of all the available image files
 */
export async function listImages(_req, res) {
  const files = await query(
    `SELECT
      id,
      tag,
      href,
      thumbnail
    FROM
      images
    ORDER BY id ASC`,
    [],
  );

  return res.json(files.rows);
}

/**
 * Routing function used for GET on /images/{id}
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns The requested image file
 */
export async function getImage(req, res) {
  const { imageId: id } = req.params;
  const actualFile = await singleQuery('SELECT tag FROM images WHERE id = $1', [
    id,
  ]);

  if (actualFile) {
    const currPath = path.dirname(fileURLToPath(import.meta.url));
    const imageExists = await exists(
      path.join(currPath, `../../data/files/${actualFile.tag}`),
    );

    if (imageExists) {
      const split = actualFile.tag.split('.');

      let mime = split[split.length - 1];

      // Content-Type header assumes these tags
      if (mime === 'jpg') mime = 'jpeg';
      if (mime === 'tif') mime = 'tiff';

      // Different image types ranging from jpg to tiff, grab the file extension and use that
      // We assume the file extension is "honest"
      // Note: Browsers will not actually render tiff images so those create a download link instead
      res.setHeader('Content-Type', `image/${mime}`);
      return res.sendFile(path.join(currPath, `../../data/files/${actualFile.tag}`));
    }
  }

  return res.status(404).json(null);
}
