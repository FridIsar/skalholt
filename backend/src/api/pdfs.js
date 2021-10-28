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
  singleQuery,
  deleteQuery,
  insertPdf,
} from '../db.js';

/**
 * Routing function used for GET on /pdf
 *
 * @param {Object} _req request object ( Not used )
 * @param {Object} res  response object
 * @returns JSON response with the info of all the available pdf files
 */
export async function listPdfs(_req, res) {
  const files = await query(
    `SELECT
      id,
      tag,
      href
    FROM
      pdfs
    ORDER BY id ASC`,
    [],
  );

  return res.json(files.rows);
}

/**
 * Routing function used for GET on /pdf/{id}
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns The requested pdf file
 */
export async function getPdf(req, res) {
  const { pdfId: id } = req.params;
  const actualFile = await singleQuery('SELECT tag FROM pdfs WHERE id = $1', [
    id,
  ]);

  if (actualFile) {
    const currPath = path.dirname(fileURLToPath(import.meta.url));
    const pdfExists = await exists(
      path.join(currPath, `../../data/files/${actualFile.tag}`),
    );

    if (pdfExists) {
      res.setHeader('Content-Type', 'application/pdf');
      return res.sendFile(path.join(currPath, `../../data/files/${actualFile.tag}`));
    }
  }

  return res.status(404).json(null);
}

/**
 * Routing function used for POST on /pdf
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the insert
 */
export async function createPdf(req, res) {
  const {
    major_group: majorGroup,
  } = req.body;
  const { file: { path: pdfPath, originalname: pdfName } = {} } = req;

  if (pdfPath) {
    try {
      const currPath = path.dirname(fileURLToPath(import.meta.url));
      const newPath = `../../data/files/${pdfName}`;

      const alreadyExists = await exists(path.join(currPath, newPath));

      if (alreadyExists) {
        return res
          .status(409)
          .json({ error: 'a file with that name already exists' });
      }

      const data = readFileSync(pdfPath);
      writeFileSync(path.join(currPath, newPath), data);

      const insertFileResult = await insertPdf({ pdfName, majorGroup });

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
 * Routing function used for DELETE on /pdf/{id},
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the deletion
 */
export async function removePdf(req, res) {
  const { pdfId } = req.params;

  try {
    const actualFile = await singleQuery(
      'SELECT tag FROM pdfs WHERE id = $1',
      [pdfId],
    );

    if (actualFile) {
      const currPath = path.dirname(fileURLToPath(import.meta.url));
      const newPath = `../../data/files/${actualFile.tag}`;
      const pdfExists = await exists(path.join(currPath, newPath));

      if (pdfExists) {
        await deleteFile(path.join(currPath, newPath));
      }
    }

    const deleted = await deleteQuery('DELETE FROM pdfs WHERE id = $1', [
      pdfId,
    ]);

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete pdf ${pdfId}`, err);
  }

  return res.status(500).json(null);
}
