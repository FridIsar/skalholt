import path from 'path';
import { fileURLToPath } from 'url';

import { logger } from '../utils/logger.js';
import {
  exists,
  readFile,
  writeFile,
  deleteFile,
} from '../utils/fileSystem.js';
import {
  query,
  deleteQuery,
  singleQuery,
  insertFile,
} from '../db.js';

/**
 * Routing function used for GET on /files
 *
 * @param {Object} _req request object ( Not used )
 * @param {Object} res  response object
 * @returns JSON response with the info of all the available csv files
 */
export async function listFiles(_req, res) {
  const files = await query(
    `SELECT
      id,
      tag,
      href,
      major_group
    FROM
      files
    ORDER BY major_group ASC`,
    [],
  );

  return res.json(files.rows);
}

/**
 * Routing function used for GET on /files/{id}
 *
 * NOTE:
 * * This uses res.download explicitly to force a download popup,
 * if this is omitted the browser will try to render the csv itself
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns A download offer for the requested csv file
 */
export async function getFile(req, res) {
  // Because this function explicitly expects integer ID requests
  // We can be sure that the validator function will catch malicious requests
  // As such we don't necessarily need to check the format here
  const { fileId: id } = req.params;
  const actualFile = await singleQuery('SELECT tag FROM files WHERE id = $1', [
    id,
  ]);

  if (actualFile) {
    const currPath = path.dirname(fileURLToPath(import.meta.url));
    const csvExists = await exists(
      path.join(currPath, `../../data/files/${actualFile.tag}`),
    );

    // res.download gives us the actual filename rather than the routed filename
    // It also overrides certain browsers trying to render the csv themselves
    if (csvExists) {
      res.setHeader('Content-Type', 'text/csv');
      return res.download(
        path.join(currPath, `../../data/files/${actualFile.tag}`),
        actualFile.tag,
      );
    }
  }

  return res.status(404).json(null);
}

/**
 * Routing function used for POST on /files
 *
 * NOTE:
 * * Most of the additional data is generated from the file name.
 * It is important the uploaded file name actually reflect what is in it
 * and how it should be grouped.
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the insert
 */
export async function createFile(req, res) {
  const { file: { path: csvPath, originalname: csvName } = {} } = req;

  if (csvPath) {
    try {
      const currPath = path.dirname(fileURLToPath(import.meta.url));
      const newPath = `../../data/files/${csvName}`;

      const alreadyExists = await exists(path.join(currPath, newPath));

      if (alreadyExists) {
        return res
          .status(409)
          .json({ error: 'a file with that name already exists' });
      }

      const data = await readFile(csvPath);
      await writeFile(path.join(currPath, newPath), data);

      const insertFileResult = await insertFile({
        csvName,
      });

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
 * Routing function used for DELETE on /files/{id},
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the deletion
 */
export async function removeFile(req, res) {
  const { fileId } = req.params;

  try {
    const actualFile = await singleQuery(
      'SELECT tag FROM files WHERE id = $1',
      [fileId],
    );

    if (actualFile) {
      const currPath = path.dirname(fileURLToPath(import.meta.url));
      const newPath = `../../data/files/${actualFile.tag}`;
      const csvExists = await exists(path.join(currPath, newPath));

      if (csvExists) {
        await deleteFile(path.join(currPath, newPath));
      }
    }

    const deleted = await deleteQuery('DELETE FROM files WHERE id = $1', [
      fileId,
    ]);

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete file ${fileId}`, err);
  }

  return res.status(500).json(null);
}

export async function getFilesByGroup(group) {
  const files = await query(
    `SELECT
      id,
      tag,
      major_group,
      href
    FROM
      files
    WHERE
      f_group = $1
    ORDER BY major_group ASC`,
    [group],
  );

  return files.rows;
}

export async function getFilesByBuilding(id) {
  const files = await query(
    `SELECT
      id,
      tag,
      major_group,
      href
    FROM
      files
    WHERE
      f_group IN
        (
          SELECT DISTINCT
            f_group
          FROM
            finds
          WHERE
            building = $1
        )
    ORDER BY major_group ASC`,
    [id],
  );

  return files.rows;
}
