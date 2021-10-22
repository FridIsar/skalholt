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
