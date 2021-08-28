/* eslint-disable no-await-in-loop */
import { query, singleQuery } from './db.js';
import { readStream, readDir } from './utils/fileSystem.js';
import { yearToPreviousDecade, yearToNextDecade } from './utils/decadeHelpers.js';

const YEARS_SVG_ROUTE = '/years/';
const FILES_ROUTE = '/files/';

let currentBuilding = 1;
let currentFile = 1;

async function importFile(fileName) {
  const q = `
    INSERT INTO
      files
      (
        tag,
        f_group,
        href
      )
    VALUES
      (
        $1,
        $2,
        $3
      )`;

  // The filenames need to match the routing system for this to work
  const f = fileName.split('.');
  const values = [
    fileName,
    f[0],
    `${FILES_ROUTE}${currentFile}`,
  ];

  await query(q, values);

  currentFile += 1;
}

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

async function importFinds(find, type) {
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
    type,
    find.fragments ? find.fragments : 1,
    buildingId.id,
  ];

  await query(q, values);
}

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

  // Import each find category with the required file group type
  // See the file_group ENUM in the sql schema
  const writing = await readStream('./data/csv/writing.csv');

  console.info('Importing writing implements');
  for (let i = 0; i < writing.length; i += 1) {
    await importFinds(writing[i], 'writing');
  }

  const keyList = await readStream('./data/csv/keys.csv');

  console.info('Importing keys');
  for (let i = 0; i < keyList.length; i += 1) {
    await importFinds(keyList[i], 'keys');
  }

  const pottery = await readStream('./data/csv/pottery.csv');

  console.info('Importing pottery');
  for (let i = 0; i < pottery.length; i += 1) {
    await importFinds(pottery[i], 'pottery');
  }

  const tiles = await readStream('./data/csv/tiles.csv');

  console.info('Importing tiles');
  for (let i = 0; i < tiles.length; i += 1) {
    await importFinds(tiles[i], 'tiles');
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
