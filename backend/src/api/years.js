import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { isInt } from '../utils/typeChecking.js';
import { exists } from '../utils/fileSystem.js';
import {
  query,
  singleQuery,
  // deleteQuery,
  // conditionalUpdate
} from '../db.js';

export async function listYears(_req, res) {
  const years = await query(
    `SELECT
      id AS year
    FROM
      years
    ORDER BY year ASC`,
    [],
  );

  return res.json(years.rows);
}

async function yearDetails(id) {
  const year = await singleQuery(
    `SELECT
      id AS year,
      svg_uri
    FROM
      years
    WHERE
      id = $1`,
    [id],
  );

  if (!year) {
    return null;
  }

  return year;
}

export async function listYear(req, res) {
  const { yearId: id } = req.params;

  if (isInt(id)) {
    const data = await yearDetails(id);
    return res.json(data);
  }

  const path = dirname(fileURLToPath(import.meta.url));
  const svgExists = await exists(join(path, `../../data/svg/years/${id}`));

  if (svgExists) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.sendFile(join(path, `../../data/svg/years/${id}`));
  }

  return null;
}
