/* eslint-disable no-await-in-loop */
import { query, singleQuery } from './db.js';
import { readStream, readDir } from './utils/fileSystem.js';
import { yearToPreviousDecade, yearToNextDecade } from './utils/decadeHelpers.js';

const YEARS_SVG_ROUTE = '/years/';
const FILES_ROUTE = '/files/';

let currentBuilding = 1;
let currentFile = 1;

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

async function importKeys(k) {
  const q = `
    INSERT INTO
      finds_keys
      (
        finds_no,
        find_id,
        context,
        key_no,
        find_date,
        photo,
        completeness,
        material,
        condition,
        length,
        weight,
        bow,
        type,
        shape_bow,
        collar,
        size_bow,
        length_stem,
        stem,
        thickness_stem,
        bit_teeth,
        bit_shape,
        id_1,
        notes,
        phase,
        building,
        start_year,
        end_year,
        real_date,
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
        $17,
        $18,
        $19,
        $20,
        $21,
        $22,
        $23,
        $24,
        $25,
        $26,
        $27,
        $28,
        $29,
        $30
      )`;

  const buildingId = await singleQuery(
    `SELECT
      id
    FROM
      buildings
    WHERE
      phase = $1`,
    [k.phase],
  );

  const values = [
    k.finds_no || null,
    k.find_id || null,
    k.context || null,
    k.key_no || null,
    k.find_date || null,
    k.photo || null,
    k.completeness || null,
    k.material || null,
    k.condition || null,
    k.length || null,
    k.weight || null,
    k.bow || null,
    k.type || null,
    k.shape_bow || null,
    k.collar || null,
    k.size_bow || null,
    k.length_stem || null,
    k.stem || null,
    k.thickness_stem || null,
    k.bit_teeth || null,
    k.bit_shape || null,
    k.id_1 || null,
    k.notes || null,
    k.phase || null,
    buildingId.id || null,
    k.start_year || null,
    k.end_year || null,
    k.real_date || null,
    k.time_period || null,
    k.attribution || null,
  ];

  await query(q, values);
}

async function importFile(fileName) {
  const q = `
    INSERT INTO
      files
      (
        tag,
        href
      )
    VALUES
      (
        $1,
        $2
      )`;

  const values = [
    fileName,
    `${FILES_ROUTE}${currentFile}`,
  ];

  await query(q, values);

  currentFile += 1;
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

  const keyList = await readStream('./data/csv/keys.csv');

  console.info('Importing keys');
  for (let i = 0; i < keyList.length; i += 1) {
    await importKeys(keyList[i]);
    console.info(keyList[i].type);
  }

  const fileNames = await readDir('./data/files');
  for (let i = 0; i < fileNames.length; i += 1) {
    await importFile(fileNames[i]);
    console.info(fileNames[i]);
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
