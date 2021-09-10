/* eslint-disable no-await-in-loop */

// NOTE
//
// These are the functions used when importing csv data
// into the database
//
// Some data formatting is done to make the csv files match
// the schema of the database in use
//
// Minimal typechecking and validation is done
// These files are all on the local filesystem and should be safe
// If local files are compromised we have bigger problems than csv setup

import { query, singleQuery } from './db.js';
import { readStream, readDir } from './utils/fileSystem.js';
import { yearToPreviousDecade, yearToNextDecade } from './utils/decadeHelpers.js';

// Filesystem routes and global counters
const YEARS_SVG_ROUTE = '/years/';
const FILES_ROUTE = '/files/';
const MAJOR_FILE_GROUPS = [
  'buildings',
  'features',
];

let currentBuilding = 1;
let currentFile = 1;

function validateFileGroup(filename) {
  return MAJOR_FILE_GROUPS.indexOf(filename.toLowerCase()) >= 0;
}

/**
 * Inserts shared file information into the database
 *
 * Database columns are constructed from filenames
 * They should therefore match the filegroup and have
 * descriptive names
 *
 * @param {string} fileName the filename of the file to import
 */
async function importFile(fileName) {
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
      )`;

  // The filenames need to match the routing system for this to work
  const f = fileName.split('.');
  const mg = validateFileGroup(f[0]) ? f[0] : 'finds';
  const values = [
    fileName,
    f[0],
    mg,
    `${FILES_ROUTE}${currentFile}`,
  ];

  await query(q, values);

  // Maintain an ID counter to be able to self reference the file route
  currentFile += 1;
}

/**
 * Inserts a csv year row into the database
 *
 * There is an assumption that the svg files required
 * are correcly named and stored in /data/svg/years
 * ( name representing start year and already optimized )
 *
 * @param {Object} year the csv year row to be inserted
 */
async function importYear(year) {
  const q = `
    INSERT INTO
      years
      (year, image, description)
    VALUES
      ($1, $2, $3)`;

  const values = [
    year.year,
    (YEARS_SVG_ROUTE + year.svg) || null,
    year.description || null,
  ];

  await query(q, values);
}

/**
 * Inserts a csv building row into the database
 *
 * There is an assumption that the svg files required
 * are correcly named and stored in /data/svg/buildings
 * ( name representing building id and already optimized )
 * see buildings.csv file for the ID references of the svg files
 *
 * @param {Object} building the csv building row to be inserted
 */
async function importBuilding(building) {
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
      )`;

  // Values are await inserted in a loop so we should be able to rely on the counter ID
  const svgRoute = `${YEARS_SVG_ROUTE}${building.start}/buildings/${currentBuilding}.svg`;

  const values = [
    building.phase,
    yearToPreviousDecade(building.start) || null,
    yearToNextDecade(building.end) || null,
    building.path || null,
    building.description || null,
    building.en || null,
    building.is || null,
    svgRoute,
  ];

  await query(q, values);

  currentBuilding += 1;
}

/**
 * Inserts a csv feature row into the database
 *
 * Only feature type and description is stored for database lookup
 * other columns are only available for download
 *
 * @param {Object} feature the csv feature row to be inserted
 */
async function importFeatures(feature) {
  const q = `
    INSERT INTO
      features
      (
        type,
        description,
        building
      )
    VALUES
      (
        $1,
        $2,
        $3
      )`;

  const buildingId = await singleQuery(
    `SELECT
      id
    FROM
      buildings
    WHERE
      phase = $1`,
    [feature['Building Phase']],
  );

  if (!buildingId) {
    return;
  }

  const values = [
    feature['Unit type'] || null,
    feature.Description || null,
    buildingId.id || null,
  ];

  await query(q, values);
}

/**
 * Inserts a csv find row into the database
 *
 * @param {Object} find the find row to be inserted
 */
async function importFinds(find) {
  const q = `
    INSERT INTO
      finds
      (
        obj_type,
        material_type,
        f_group,
        fragments,
        building
      )
    VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5
      )`;

  const buildingId = await singleQuery(
    `SELECT
      id
    FROM
      buildings
    WHERE
      phase = $1`,
    [find.phase],
  );

  if (!buildingId) {
    return;
  }

  const values = [
    find.obj_type || null,
    find.material_type || null,
    find.datafile || null,
    find.fragments ? find.fragments : 1,
    buildingId.id,
  ];

  await query(q, values);
}

/**
 * Driver function for database inserts
 *
 * Reads through predefined csv files
 * in a rowwise manner and sends each row
 * to the correct insertion function
 *
 * NOTE: Could make this process faster
 *       by doing bulk inserts instead of
 *       rowwise, but we lose granular control
 *       and this script is only used for setup
 *       and teardown and should not ever be used
 *       while the backend is running in production
 */
export async function importData() {
  const fileNames = await readDir('./data/files');

  console.info('Importing shared files');
  for (let i = 0; i < fileNames.length; i += 1) {
    await importFile(fileNames[i]);
  }

  const years = await readStream('./data/csv/years.csv');

  console.info('Importing years');
  for (let i = 0; i < years.length; i += 1) {
    await importYear(years[i]);
  }

  const buildings = await readStream('./data/csv/buildings.csv');

  console.info('Importing buildings');
  for (let i = 0; i < buildings.length; i += 1) {
    await importBuilding(buildings[i]);
  }

  const features = await readStream('./data/csv/features.csv');

  console.info('Importing features');
  for (let i = 0; i < features.length; i += 1) {
    await importFeatures(features[i]);
  }

  const finds = await readStream('./data/csv/finds.csv');

  console.info('Importing finds');
  for (let i = 0; i < finds.length; i += 1) {
    await importFinds(finds[i]);
  }

  await query(
    `INSERT INTO
      logging(
        curr_building_id,
        curr_file_id)
    VALUES($1, $2)`,
    [currentBuilding - 1, currentFile - 1],
  );
}
