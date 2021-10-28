import path from 'path';
import fs from 'fs';
// For some reason sharp case sensitivity breaks linting... ???
// eslint-disable-next-line import/no-extraneous-dependencies
import Sharp from 'sharp';
import { fileURLToPath } from 'url';

import { logger } from '../utils/logger.js';
import {
  exists,
  deleteFile,
} from '../utils/fileSystem.js';
import {
  query,
  singleQuery,
  deleteQuery,
  insertImage,
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
      href
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
 * NOTE: This accepts width and height querystrings for the creation of thumbnails
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns The requested image file
 */
export async function getImage(req, res) {
  const { imageId: id } = req.params;
  const {
    width: w,
    height: h,
    crop: c,
    quality: q,
  } = req.query;
  const actualFile = await singleQuery('SELECT tag FROM images WHERE id = $1', [
    id,
  ]);

  if (actualFile) {
    const currPath = path.dirname(fileURLToPath(import.meta.url));
    const imageExists = await exists(
      path.join(currPath, `../../data/files/${actualFile.tag}`),
    );

    if (imageExists) {
      // If alterations are requested we pipe through a Sharp transform stream
      if (w && h) {
        const width = parseInt(w, 10);
        const height = parseInt(h, 10);
        const quality = q ? parseInt(q, 10) : 100;

        const stream = fs.createReadStream(path.join(currPath, `../../data/files/${actualFile.tag}`));

        const transform = Sharp().resize(width, height, {
          fit: c || 'cover',
        }).toFormat('webp', {
          quality,
        });

        stream.pipe(transform).on('error', (err) => {
          // Something borked, log the output
          logger.error(`Unable to transform image ${id}`, err);
          res.status(500);
        }).pipe(res);

        res.setHeader('Content-Type', 'image/webp');
        return stream;
      }

      // If no ( valid ) alterations were requested just pass the image as is

      const split = actualFile.tag.split('.');

      // Different image types ranging from jpg to tiff, grab the file extension and use that
      // We assume the file extension is "honest"
      // Note: Browsers will not actually render tiff images so those create a download link instead
      let mime = split[split.length - 1];

      // Content-Type header assumes these tags
      if (mime === 'jpg') mime = 'jpeg';
      if (mime === 'tif') mime = 'tiff';

      res.setHeader('Content-Type', `image/${mime}`);
      return res.sendFile(path.join(currPath, `../../data/files/${actualFile.tag}`));
    }
  }

  return res.status(404).json(null);
}

/**
 * Routing function used for POST on /images
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the insert
 */
export async function createImage(req, res) {
  const {
    major_group: majorGroup,
  } = req.body;
  const { file: { path: imagePath, originalname: imageName } = {} } = req;

  if (imagePath) {
    try {
      const currPath = path.dirname(fileURLToPath(import.meta.url));
      const newPath = `../../data/files/${imageName}`;

      const alreadyExists = await exists(path.join(currPath, newPath));

      if (alreadyExists) {
        return res
          .status(409)
          .json({ error: 'a file with that name already exists' });
      }

      const data = fs.readFileSync(imagePath);
      fs.writeFileSync(path.join(currPath, newPath), data);

      const insertFileResult = await insertImage({ imageName, majorGroup });

      if (insertFileResult) {
        return res.status(201).json(insertFileResult);
      }
    } catch (err) {
      return res.status(500).end();
    }
  }

  return res.status(400).json({ error: 'No file in request' });
}

/**
 * Routing function used for DELETE on /images/{id},
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the deletion
 */
export async function removeImage(req, res) {
  const { imageId } = req.params;

  try {
    const actualFile = await singleQuery(
      'SELECT tag FROM images WHERE id = $1',
      [imageId],
    );

    if (actualFile) {
      const currPath = path.dirname(fileURLToPath(import.meta.url));
      const newPath = `../../data/files/${actualFile.tag}`;
      const imageExists = await exists(path.join(currPath, newPath));

      if (imageExists) {
        await deleteFile(path.join(currPath, newPath));
      }
    }

    const deleted = await deleteQuery('DELETE FROM images WHERE id = $1', [
      imageId,
    ]);

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete image ${imageId}`, err);
  }

  return res.status(500).json(null);
}
