/* eslint-disable no-await-in-loop */
import dotenv from 'dotenv';
import pg from 'pg';
import xss from 'xss';

import { logger } from './utils/logger.js';
import requireEnv from './utils/requireEnv.js';
import { yearToNextDecade, yearToPreviousDecade } from './utils/decadeHelpers.js';

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
 * @property {number} year - The number of the year
 * @property {string | null} image - Route for the background svg if defined
 */

/**
 * Building
 * @typedef {Object} Building
 * @property {number} id - ID of the building
 * @property {string} phase - Phase reference of the building
 * @property {number} start - Year that the building starts appearing
 * @property {number} end - Year that the building stops appearing
 * @property {string | null} path - Path to draw relative to the year background if defined
 * @property {string | null} description - Description text of the building if defined
 * @property {string | null} en - English building attribution if defined
 * @property {string | null} is - Icelandic building attribution if defined
 * @property {string | null} image - Route for the building background if defined
 */

/**
 * Find
 * @typedef {Object} Find
 * @property {number} id - ID of the find
 * @property {number | null} quant - Quantity of the found item if defined
 * @property {string | null} type - Description text of the find if defined
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

export async function conditionalUpdate(table, key, id, fields, values) {
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

  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      ${key} = $1
    RETURNING *
    `;

  const queryValues = [id].concat(filteredValues);

  const result = await query(q, queryValues);

  return result;
}

export async function insertYear({
  year,
  svg,
}) {
  const q = `
    INSERT INTO
      years
      (year, image)
    VALUES
      ($1, $2)
    RETURNING
      *`;
  const values = [
    xss(year),
    svg ? xss(svg) : null,
  ];

  try {
    const result = await query(q, values);
    return result.rows[0];
  } catch (err) {
    logger.error('Error inserting year', err);
  }

  return null;
}

export async function insertBuilding({
  phase,
  startYear,
  endYear,
  path,
  description,
  english,
  icelandic,
  svg,
}) {
  const q = `
    INSERT INTO
      buildings
      (
        phase,
        start_year,
        end_year,
        path,
        description,
        english,
        icelandic,
        image
      )
    VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
    RETURNING
      id,
      phase,
      start_year AS start,
      end_year AS end,
      path,
      description,
      english AS en,
      icelandic AS is,
      image`;

  const shiftStart = yearToPreviousDecade(startYear);
  const shiftEnd = yearToNextDecade(endYear);

  const values = [
    xss(phase),
    xss(shiftStart),
    xss(shiftEnd),
    path ? xss(path) : null,
    description ? xss(description) : null,
    english ? xss(english) : null,
    icelandic ? xss(icelandic) : null,
    svg ? xss(svg) : null,
  ];

  try {
    const result = await query(q, values);
    return result.rows[0];
  } catch (err) {
    logger.error('Error inserting building', err);
  }

  return null;
}
