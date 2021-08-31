import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import xss from 'xss';

import { exists } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
import { isString } from '../utils/typeChecking.js';
import configureSvg from '../utils/configureSvg.js';
import {
  query,
  deleteQuery,
  conditionalUpdate,
  insertYear,
} from '../db.js';

export async function listYears(_req, res) {
  const years = await query(
    `SELECT
      year,
      image,
      description
    FROM
      years
    WHERE
      year < (SELECT MAX(year) FROM years)
    AND
      year >= 1670
    ORDER BY year ASC`,
    [],
  );

  return res.json(years.rows);
}

export async function listYear(req, res) {
  const { yearId: id } = req.params;

  const path = dirname(fileURLToPath(import.meta.url));
  const svgExists = await exists(join(path, `../../data/svg/years/${id}`));

  if (svgExists) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.sendFile(join(path, `../../data/svg/years/${id}`));
  }

  return res.status(404).json(null);
}

export async function createYear(req, res) {
  const { year } = req.body;
  const { file: { path: imagePath } = {} } = req;

  let svg = null;

  if (imagePath) {
    try {
      const miniSvg = await configureSvg(imagePath, year, '/years/');
      if (!miniSvg) throw new Error('Failed to parse svg');

      svg = miniSvg;
    } catch (err) {
      return res.status(500).end();
    }
  }

  const insertYearResult = await insertYear({
    year,
    svg,
  });

  if (insertYearResult) {
    return res.status(201).json(insertYearResult);
  }

  return res.status(500).end();
}

export async function deleteYear(req, res) {
  const { yearId } = req.params;

  try {
    const deleted = await deleteQuery(
      'DELETE FROM years WHERE year = $1',
      [yearId],
    );

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete year ${yearId}`, err);
  }

  return res.status(500).json(null);
}

export async function updateYear(req, res) {
  const { yearId: id } = req.params;
  const { body } = req;
  const { file: { path: imagePath } = {} } = req;

  if (body.image && imagePath) return res.status(400).json(null);

  const fields = [
    isString(body.description) ? 'description' : null,
  ];

  const values = [
    isString(body.description) ? xss(body.description) : null,
  ];

  let svg = null;

  if (imagePath) {
    try {
      const miniSvg = await configureSvg(imagePath, id, '/years/');
      if (!miniSvg) throw new Error('Failed to parse svg');

      svg = miniSvg;
    } catch (err) {
      return res.status(500).end();
    }
  } else if (body.image) {
    svg = body.image;
  }

  if (svg) {
    fields.push('image');
    values.push(svg);
  }

  const result = await conditionalUpdate('years', 'year', id, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}
