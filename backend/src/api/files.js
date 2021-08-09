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

export async function listFiles(_req, res) {
  const files = await query(
    `SELECT
      id,
      tag,
      href
    FROM
      files`,
    [],
  );

  return res.json(files.rows);
}

// Likely want this to just redirect to external host if one is implemented
export async function getFile(req, res) {
  const { fileId: id } = req.params;
  const actualFile = await singleQuery('SELECT tag FROM files WHERE id = $1', [id]);

  if (actualFile) {
    const currPath = path.dirname(fileURLToPath(import.meta.url));
    const csvExists = await exists(path.join(currPath, `../../data/files/${actualFile.tag}`));

    // res.download gives us the actual filename rather than the routed filename
    // It also overrides certain browsers trying to render the csv themselves
    if (csvExists) {
      res.setHeader('Content-Type', 'text/csv');
      return res.download(path.join(currPath, `../../data/files/${actualFile.tag}`), actualFile.tag);
    }
  }

  return res.status(404).json(null);
}

// Possible TODO:
// Create and update are extremely similar, could combine?
// Would need to pass responses around for different reaction

export async function createFile(req, res) {
  const { file: { path: csvPath, originalname: csvName } = {} } = req;

  if (csvPath) {
    try {
      const currPath = path.dirname(fileURLToPath(import.meta.url));
      const newPath = `../../data/files/${csvName}`;

      // Block overwrites, PATCH is also provided and should be used instead
      const alreadyExists = await exists(path.join(currPath, newPath));

      if (alreadyExists) {
        return res.status(400).json({ error: 'a file with that name already exists' });
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

export async function updateFile(req, res) {
  const { file: { path: csvPath, originalname: csvName } = {} } = req;

  if (csvPath) {
    try {
      const currPath = path.dirname(fileURLToPath(import.meta.url));
      const newPath = `../../data/files/${csvName}`;

      // Block new writes, POST is also provided and should be used instead
      const alreadyExists = await exists(path.join(currPath, newPath));

      if (!alreadyExists) {
        return res.status(404).json({ error: 'no file with that name exists' });
      }

      const data = await readFile(csvPath);
      await writeFile(path.join(currPath, newPath), data);

      return res.status(200).end();
    } catch (err) {
      return res.status(500).end();
    }
  }

  return res.status(400).json({ error: 'Nothing to update' });
}

export async function removeFile(req, res) {
  const { fileId } = req.params;

  try {
    const actualFile = await singleQuery('SELECT tag FROM files WHERE id = $1', [fileId]);

    if (actualFile) {
      const currPath = path.dirname(fileURLToPath(import.meta.url));
      const newPath = `../../data/files/${actualFile.tag}`;
      const csvExists = await exists(path.join(currPath, newPath));

      if (csvExists) {
        await deleteFile(path.join(currPath, newPath));
      }
    }

    const deleted = await deleteQuery(
      'DELETE FROM files WHERE id = $1', [fileId],
    );

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete file ${fileId}`, err);
  }

  return res.status(500).json(null);
}
