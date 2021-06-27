/* eslint-disable no-await-in-loop */
import { query } from './db.js';
import { readStream } from './utils/fileSystem.js';
import { yearToPreviousDecade, yearToNextDecade } from './utils/decadeHelpers.js';

const YEARS_SVG_ROUTE = '/years/';
let currentBuilding = 1;

async function importYear(year) {
  const q = `
    INSERT INTO
      years
      (year, image)
    VALUES
      ($1, $2)`;

  const values = [
    year.year,
    (YEARS_SVG_ROUTE + year.svg) || null,
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

  const svgRoute = `${YEARS_SVG_ROUTE}${building.start}/buildings/${currentBuilding}.svg`;

  const values = [
    building.phase,
    yearToPreviousDecade(building.start),
    yearToNextDecade(building.end),
    building.path || null,
    building.description || null,
    building.en || null,
    building.is || null,
    svgRoute,
  ];

  await query(q, values);

  currentBuilding += 1;
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

  // TODO: Rooms, Finds
}
