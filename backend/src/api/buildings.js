import xss from 'xss';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { exists } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
import { isString, isInt } from '../utils/typeChecking.js';
import configureSvg from '../utils/configureSvg.js';
import {
  query,
  singleQuery,
  deleteQuery,
  conditionalUpdate,
  insertBuilding,
} from '../db.js';

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

async function buildingDetails(id, year) {
  if (!id) {
    return null;
  }

  const building = await singleQuery(
    `SELECT
      id, id AS name, phase, start_year AS start, end_year AS end, path AS d, description, english AS en, icelandic AS is, image
    FROM
      buildings
    WHERE
      id = $1
    AND
      $2 >= start_year AND $2 < end_year`,
    [id, year],
  );

  if (!building) {
    return null;
  }

  return building;
}

export async function listBuilding(req, res) {
  const { yearId, buildingId: buildingNumber } = req.params;

  if (isInt(buildingNumber)) {
    const data = await buildingDetails(buildingNumber, yearId);
    if (data) return res.json(data);
  }

  const path = dirname(fileURLToPath(import.meta.url));
  const svgExists = await exists(join(path, `../../data/svg/buildings/${buildingNumber}`));

  if (svgExists) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.sendFile(join(path, `../../data/svg/buildings/${buildingNumber}`));
  }

  return res.status(404).json(null);
}

export async function listBuildings(req, res) {
  const { yearId: id } = req.params;

  const buildings = await query(
    `SELECT
      id, id AS name, path AS d, start_year AS start, end_year AS end, english AS en, icelandic AS is
    FROM
      buildings
    WHERE
      $1 >= start_year AND $1 < end_year`,
    [id],
  );

  if (buildings && buildings.rows[0]) {
    return res.json(buildings.rows);
  }

  return res.status(404).json(null);
}

export async function createBuilding(req, res) {
  const {
    phase,
    start: startYear,
    end: endYear,
    path = null,
    description = null,
    en: english = null,
    is: icelandic = null,
  } = req.body;
  const { file: { path: imagePath } = {} } = req;

  let svg = null;

  if (imagePath) {
    try {
      // This is not reliable if we allow multiple users to post buildings...
      const id = await singleQuery('SELECT MAX(id) FROM buildings', []);

      const type = `/years/${startYear}/buildings/`;

      const miniSvg = await configureSvg(imagePath, (id.max + 1), type);
      if (!miniSvg) throw new Error('Failed to parse svg');

      svg = miniSvg;
    } catch (err) {
      return res.status(500).end();
    }
  }

  const insertBuildingResult = await insertBuilding({
    phase,
    startYear,
    endYear,
    path,
    description,
    english,
    icelandic,
    svg,
  });

  if (insertBuildingResult) {
    return res.status(201).json(insertBuildingResult);
  }

  return res.status(500).end();
}

export async function deleteBuilding(req, res) {
  const { buildingId } = req.params;

  try {
    const deleted = await deleteQuery(
      'DELETE FROM buildings WHERE id = $1',
      [buildingId],
    );

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete building ${buildingId}`, err);
  }

  return res.status(500).json(null);
}

export async function updateBuilding(req, res) {
  const { yearId, buildingId: id } = req.params;
  const { body } = req;
  const { file: { path: imagePath } = {} } = req;

  if (body.image && imagePath) return res.status(400).json(null);

  const fields = [
    isString(body.phase) ? 'phase' : null,
    isInt(body.start) ? 'start_year' : null,
    isInt(body.end) ? 'end_year' : null,
    isString(body.path) ? 'path' : null,
    isString(body.description) ? 'description' : null,
    isString(body.en) ? 'english' : null,
    isString(body.is) ? 'icelandic' : null,
  ];

  const values = [
    isString(body.phase) ? xss(body.phase) : null,
    isInt(body.start) ? xss(body.start) : null,
    isInt(body.end) ? xss(body.end) : null,
    isString(body.path) ? xss(body.path) : null,
    isString(body.description) ? xss(body.description) : null,
    isString(body.en) ? xss(body.en) : null,
    isString(body.is) ? xss(body.is) : null,
  ];

  let svg = null;

  if (imagePath) {
    try {
      const miniSvg = await configureSvg(imagePath, id + 1, `/years/${yearId}/buildings/`);
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

  const result = await conditionalUpdate('buildings', 'id', id, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}
