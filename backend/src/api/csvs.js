import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';

import { logger } from '../utils/logger.js';
import {
  exists,
  deleteFile,
} from '../utils/fileSystem.js';
import {
  query,
  deleteQuery,
  singleQuery,
  insertCsv,
} from '../db.js';

/**
 * Routing function used for GET on /csv
 *
 * @param {Object} _req request object ( Not used )
 * @param {Object} res  response object
 * @returns JSON response with the info of all the available csv files
 */
export async function listCsvs(_req, res) {
  const files = await query(
    `SELECT
      id,
      tag,
      href,
      major_group
    FROM
      csvs
    ORDER BY major_group DESC`,
    [],
  );

  return res.json(files.rows);
}

/**
 * Routing function used for GET on /csv/{id}
 *
 * NOTE:
 * * This uses res.download explicitly to force a download popup,
 * if this is omitted the browser will try to render the csv itself
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns A download offer for the requested csv file
 */
export async function getCsv(req, res) {
  // Because this function explicitly expects integer ID requests
  // We can be sure that the validator function will catch malicious requests
  // As such we don't necessarily need to check the format here
  const { csvId: id } = req.params;
  const actualFile = await singleQuery('SELECT tag FROM csvs WHERE id = $1', [
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
 * Routing function used for POST on /csv
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
export async function createCsv(req, res) {
  const {
    tag,
    major_group: majorGroup,
  } = req.body;
  const { file: { path: csvPath } = {} } = req;

  if (csvPath) {
    try {
      const currPath = path.dirname(fileURLToPath(import.meta.url));
      const newPath = `../../data/files/${tag}`;

      const alreadyExists = await exists(path.join(currPath, newPath));

      if (alreadyExists) {
        return res
          .status(409)
          .json({ error: 'a file with that name already exists' });
      }

      const data = readFileSync(csvPath);
      writeFileSync(path.join(currPath, newPath), data);

      const insertFileResult = await insertCsv({ tag, majorGroup });

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
 * Routing function used for DELETE on /csv/{id},
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the deletion
 */
export async function removeCsv(req, res) {
  const { csvId } = req.params;

  try {
    const actualFile = await singleQuery(
      'SELECT tag FROM csvs WHERE id = $1',
      [csvId],
    );

    if (actualFile) {
      const currPath = path.dirname(fileURLToPath(import.meta.url));
      const newPath = `../../data/files/${actualFile.tag}`;
      const csvExists = await exists(path.join(currPath, newPath));

      if (csvExists) {
        await deleteFile(path.join(currPath, newPath));
      }
    }

    const deleted = await deleteQuery('DELETE FROM csvs WHERE id = $1', [
      csvId,
    ]);

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete csv ${csvId}`, err);
  }

  return res.status(500).json(null);
}

export async function getCsvsByGroup(group) {
  const files = await query(
    `SELECT
      id,
      tag,
      major_group,
      href
    FROM
      csvs
    WHERE
      f_group = $1
    ORDER BY major_group ASC`,
    [group],
  );

  return files.rows;
}

export async function getCsvsByBuilding(id) {
  const files = await query(
    `SELECT
      id,
      tag,
      major_group,
      href
    FROM
      csvs
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
