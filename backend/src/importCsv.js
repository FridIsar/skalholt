/* eslint-disable no-await-in-loop */
import { query, singleQuery } from './db.js';
import { readStream } from './utils/fileSystem.js';
import { yearToPreviousDecade, yearToNextDecade } from './utils/decadeHelpers.js';

const YEARS_SVG_ROUTE = '/years/';
let currentBuilding = 1;

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

async function importWriting(implement) {
  const q = `
    INSERT INTO
      finds_writing
      (
        find,
        context,
        quant,
        weight,
        obj_type,
        stone_type,
        group_no,
        space,
        area,
        unit_type,
        sieved,
        phase,
        building,
        start_year,
        end_year,
        time_period,
        attribution
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
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17
      )`;

  const buildingId = await singleQuery(
    `SELECT
      id
    FROM
      buildings
    WHERE
      phase = $1`,
    [implement.phase],
  );

  const values = [
    implement.find || null,
    implement.context || null,
    implement.quant || null,
    implement.weight || null,
    implement.obj_type || null,
    implement.stone_type || null,
    implement.group_no || null,
    implement.space || null,
    implement.area || null,
    implement.unit_type || null,
    implement.sieved || null,
    implement.phase || null,
    buildingId.id || null,
    implement.start_year || null,
    implement.end_year || null,
    implement.time_period || null,
    implement.attribution || null,
  ];

  await query(q, values);
}

export async function importData() {
  // Years
  const years = await readStream('./data/csv/years.csv');

  console.info('Importing years');
  for (let i = 0; i < years.length; i += 1) {
    await importYear(years[i]);
    console.info(years[i].year);
  }

  // Buildings
  const buildings = await readStream('./data/csv/buildings.csv');

  console.info('Importing buildings');
  for (let i = 0; i < buildings.length; i += 1) {
    await importBuilding(buildings[i]);
    console.info(buildings[i].en);
  }

  // Finds
  const writing = await readStream('./data/csv/writing.csv');

  console.info('Importing writing implements');
  for (let i = 0; i < writing.length; i += 1) {
    await importWriting(writing[i]);
    console.info(writing[i].obj_type);
  }
}
