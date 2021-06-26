/* eslint-disable no-await-in-loop */
import dotenv from 'dotenv';
import pg from 'pg';
import xss from 'xss';

import { logger } from './utils/logger.js';
import configureSvg from './utils/configureSvg.js';
import requireEnv from './utils/requireEnv.js';

dotenv.config();
requireEnv(['DATABASE_URL']);

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;
const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Error connecting to database, stopping', err);
  process.exit(-1);
});

/**
 * Year
 * @typedef {Object} Year
 * @property {number} id - The number of the year
 * @property {string | null} svg_uri Route for the background svg if defined
 */

/**
 * Building
 * @typedef {Object} Building
 * @property {number} id - ID of the building
 * @property {string} phase - Phase reference of the building
 * @property {string | null} path - Path to draw relative to the year background if defined
 * @property {string | null} description - Description text of the building if defined
 * @property {string | null} english - English building attribution if defined
 * @property {string | null} icelandic - Icelandic building attribution if defined
 * @property {string | null} svg_uri - Route for the building background if defined
 */

export async function query(_query, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(_query, values);
    return result;
  } finally {
    client.release();
  }
}

export async function singleQuery(_query, values = []) {
  const result = await query(_query, values);

  if (result.rows && result.rows.length === 1) {
    return result.rows[0];
  }

  return null;
}

export async function deleteQuery(_query, values = []) {
  const result = await query(_query, values);

  return result.rowCount;
}

export async function end() {
  await pool.end();
}

export async function conditionalUpdate(table, id, fields, values) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values
    .filter((i) => typeof i === 'string'
      || typeof i === 'number'
      || i instanceof Date);

  if (filteredFields.length === 0) {
    return false;
  }

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  // id is field = 1
  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues = [id].concat(filteredValues);

  console.info('Conditional update', q, queryValues);

  const result = await query(q, queryValues);

  return result;
}

export async function insertYear({
  id,
  svg,
}) {
  const miniSvg = await configureSvg(svg, id, '/years/');

  const q = `
    INSERT INTO
      years
      (id, svg_uri)
    VALUES
      ($1, $2)
    RETURNING
      id AS year, svg_uri
  ;`;
  const values = [
    xss(id),
    miniSvg ? xss(miniSvg) : null,
  ];

  try {
    const result = await query(q, values);
    return result.rows[0];
  } catch (err) {
    logger.error('Error inserting year', err);
  }

  return null;
}

async function buildingSvg(id, svg, start) {
  const miniSvg = await configureSvg(svg, id, `/years/${start}/buildings/`);

  await singleQuery(
    `UPDATE
      buildings
    SET
      svg_uri = $1
    WHERE
      id = $2`, [miniSvg, id],
  );
}

async function importBuildingYear(year, building) {
  const q = `
    INSERT INTO
      building_years
      (year, building)
    VALUES
      ($1, $2)`;

  const values = [year, building];

  query(q, values);
}

async function insertBuildingYears(start, e, id) {
  const startDate = (Math.ceil((parseInt(start, 10)) / 10) * 10);
  const endDate = (Math.ceil(((parseInt(e, 10)) - 10) / 10) * 10);

  for (let i = startDate; i < endDate; i += 10) {
    await importBuildingYear(i, id);
  }
}

export async function insertBuilding({
  start,
  e,
  phase,
  path,
  description,
  english,
  icelandic,
  svg,
}) {
  const q = `
    INSERT INTO
      buildings
      (phase, path, description, english, icelandic, svg_uri)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING
      id, english, icelandic
    ;`;
  const values = [
    xss(phase),
    path ? xss(path) : null,
    description ? xss(description) : null,
    english ? xss(english) : null,
    icelandic ? xss(icelandic) : null,
    null,
  ];

  try {
    const result = await query(q, values);

    const { id } = result.rows[0];
    await insertBuildingYears(start, e, id);
    await buildingSvg(id, svg, start);

    return result.rows[0];
  } catch (err) {
    logger.error('Error inserting building', err);
  }

  return null;
}
