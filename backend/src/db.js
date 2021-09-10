/* eslint-disable no-await-in-loop */

// Core database control functions
//
// All runtime database communications are
// eventually routed through functions
// provided here

import dotenv from 'dotenv';
import pg from 'pg';
import xss from 'xss';

import { logger } from './utils/logger.js';
import requireEnv from './utils/requireEnv.js';
import validateFileGroup from './utils/fileNames.js';
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

const FILES_ROUTE = '/files/';

/**
 * Year
 *
 * @typedef {Object} Year
 * @property {number} year - The number of the year
 * @property {string | null} image - Route for the background svg if defined
 * @property {string | null} description - A brief description for that year if defined
 */

/**
 * Building
 *
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
 *
 * @typedef {Object} Find
 * @property {number} id - ID of the find
 * @property {number} building - ID of the building the find belongs to
 * @property {string | null} obj_type - Object type of the find if defined
 * @property {string | null} material_type - Material type of the find if defined
 * @property {number | null} fragments - Quantity of fragments of the found item if defined
 */

/**
 * Feature
 *
 * @typedef {Object} Feature
 * @param {number} id - ID of the feature
 * @property {number} building - ID of the building the feature belongs to
 * @param {string | null} type - Type of the feature if defined
 * @param {string | null} description -  Description of the feature if defined
 */

/**
 * Function to close the established
 * database connection pool.
 */
export async function end() {
  await pool.end();
}

/**
 * Creates a database connection and runs the given prepared statement query
 * with the given statement values. Database connection is released upon completion.
 *
 * NOTE: For simplified queries on ID values that only return a single row,
 * it is recommended to use singleQuery to immediately get the result without the query
 * metadata.
 *
 * @param {string} _query the querystring to run
 * @param {Object} values the values to use in the query
 *                        need to match the prepared statement values in the query string
 * @returns the result rows of the query
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

/**
 * Creates a database connection and runs the given prepared statement query
 * with the given statement values. Database connection is released upon completion.
 *
 * NOTE: If this is misused and the query returns more than one row it will return null,
 * for a multi row result query use query() instead of singleQuery!
 *
 * @param {*} _query the querystring to run (should only expect one return row)
 * @param {*} values the values to use in the query
 *                   these need to match the prepared statement values in the query string
 * @returns the result row of the query
 */
export async function singleQuery(_query, values = []) {
  const result = await query(_query, values);

  if (result.rows && result.rows.length === 1) {
    return result.rows[0];
  }

  return null;
}

/**
 * Creates a database connection and runs the given prepared statement query
 * with the given statement values. Database connection is released upon completion.
 *
 * NOTE: Intended to use for deletions, only returns information about the rows affected.
 *
 * @param {*} _query the querystring to run (should only expect one return row)
 * @param {*} values the values to use in the query
 *                   these need to match the prepared statement values in the query string
 * @returns the rowcount of the affected rows
 */
export async function deleteQuery(_query, values = []) {
  const result = await query(_query, values);

  return result.rowCount;
}

/**
 * Creates a database connection and updates the given fields and values according
 * to the given key, in the given table. Database connection is released upon completion.
 *
 * If no valid field/value pairs are given then nothing is changed.
 *
 * @param {*} table the name of the table to update
 * @param {*} key the id key identifier to use to find the rows to update
 * @param {*} id the id value to use to find the rows to update
 * @param {*} fields the table fields to update
 * @param {*} values the values to update to for the given fields
 * @returns the result query of the update
 */
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

/**
 * Helper function to insert new entries into the files table
 *
 * @param {string} csv the name of the csv to insert
 * @returns the result of the insertion statement
 */
export async function insertFile(csv) {
  const id = await singleQuery('SELECT curr_file_id FROM logging', []);
  const newId = id.curr_file_id + 1;

  const q = `
    INSERT INTO
      files
      (
        tag,
        f_group,
        major_group,
        href
      )
    VALUES
      (
        $1,
        $2,
        $3,
        $4
      )
    RETURNING
      id,
      tag,
      f_group,
      major_group,
      href`;

  const values = [
    csv.csvName,
    csv.csvName,
    validateFileGroup(csv.csvName) ? csv.csvName : 'finds',
    `${FILES_ROUTE}${newId}`,
  ];

  try {
    const result = await query(q, values);
    await query('UPDATE logging SET curr_file_id = $1', [newId]);
    return result.rows[0];
  } catch (err) {
    logger.error('Error inserting file', err);
  }

  return null;
}

/**
 * Helper function to insert new entries into the years table
 *
 * @param {number} year the number of the year to insert
 * @param {string} svg the name of the image describing the year
 * @returns the result of the insertion statement
 */
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

/**
 * Helper function to insert new entries into the buildings table
 *
 * @param {string} phase the building phase (this is the ID generally used by Gavin)
 * @param {number} startYear the starting year that this building phase appears
 *                      will be rounded down to the nearest decade
 * @param {number} endYear the year that this building phase stops appearing
 *                    will be rounded up to the nearest decade
 * @param {string} path the svg drawing path to be used on the overlay image
 * @param {string} description the description of the building phase
 * @param {string} english the english attribution of the building
 * @param {string} icelandic the icelandic attribution of the building
 * @param {string} svg the name of the image describing the building
 * @returns the result of the insertion statement
 */
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

/**
 * Helper function to insert new entries into the features table
 *
 * @param {number} id the id of the building the feature belongs to
 * @param {string} type the major type of the feature
 * @param {string} description the description text of the feature
 * @returns the result of the insertion statement
 */
export async function insertFeature({
  id,
  type,
  description,
}) {
  const q = `
    INSERT INTO
      features
      (
        building,
        type,
        description
      )
    VALUES
      (
        $1,
        $2,
        $3
      )
    RETURNING
      *`;

  const values = [
    xss(id),
    type ? xss(type) : null,
    description ? xss(description) : null,
  ];

  try {
    const result = await query(q, values);
    return result.rows[0];
  } catch (err) {
    logger.error('Error inserting feature', err);
  }

  return null;
}

/**
 * Helper function to insert new entries into the finds table
 *
 * @param {number} id the id of the building the find belongs to
 * @param {string} objectType the type of object the find is
 * @param {string} materialType the material the find is made out of
 * @param {string} fileGroup which of the csv files contains the find
 * @param {number} fragments the quantity of fragments or units the find has
 * @returns the result of the insertion statement
 */
export async function insertFind({
  id,
  objectType,
  materialType,
  fileGroup,
  fragments,
}) {
  const q = `
    INSERT INTO
      finds
      (
        building,
        obj_type,
        material_type,
        f_group,
        fragments
      )
    VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5
      )
    RETURNING
      *`;
  const values = [
    xss(id),
    objectType ? xss(objectType) : null,
    materialType ? xss(materialType) : null,
    fileGroup ? xss(fileGroup) : null,
    fragments ? xss(fragments) : null,
  ];

  try {
    const result = await query(q, values);
    return result.rows[0];
  } catch (err) {
    logger.error('Error inserting find', err);
  }

  return null;
}
