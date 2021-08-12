/* eslint-disable no-await-in-loop */

// Cannot directly call through JEST
// Testing environment tries to force SSL

// ( Could configure SSL, BUT! )
// ( Would require SSL to be configured,
//   for every computer that runs the tests )

// Cannot call setup script directly
// Causes duplicate table creations and crashes

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  readFile,
  readDir,
  deleteFile,
  writeFile,
} from './utils/fileSystem.js';
import { query, singleQuery } from './db.js';
import { importData } from './importCsv.js';
import requireEnv from './utils/requireEnv.js';

dotenv.config();
requireEnv(['DATABASE_URL']);

const CURR_PATH = path.dirname(fileURLToPath(import.meta.url));

async function cleanYears() {
  const yearNames = await readDir('./data/svg/years');

  for (let i = 0; i < yearNames.length; i += 1) {
    const fileName = yearNames[i].split('.');
    if (Number(fileName[0]) > 2000) {
      await deleteFile(path.join(CURR_PATH, `../data/svg/years/${fileName[0]}.svg`));
    }
  }
}

async function cleanBuildings() {
  const buildingNames = await readDir('./data/svg/buildings');

  const result = await singleQuery('SELECT curr_building_id FROM logging', []);
  const cutoffId = Number(result.curr_building_id);

  for (let i = 0; i < buildingNames.length; i += 1) {
    const fileName = buildingNames[i].split('.');
    if (Number(fileName[0]) > cutoffId) {
      await deleteFile(path.join(CURR_PATH, `../data/svg/buildings/${fileName[0]}.svg`));
    }
  }
}

async function cleanFiles() {
  console.info('Removing files created by testing');
  const fileNames = await readDir('./data/files');

  for (let i = 0; i < fileNames.length; i += 1) {
    await deleteFile(path.join(CURR_PATH, `../data/files/${fileNames[i]}`));
  }

  const sharedFiles = await readDir('./data/csv/shared');

  for (let i = 0; i < sharedFiles.length; i += 1) {
    const sharedFile = `../data/csv/shared/${sharedFiles[i]}`;
    const data = await readFile(path.join(CURR_PATH, sharedFile));

    await writeFile(path.join(CURR_PATH, `../data/files/${sharedFiles[i]}`), data);
  }
}

export default async function teardown() {
  try {
    await cleanFiles();
    console.info('Cleaning test csv files');
  } catch (err) {
    console.error('Error while removing test csv files', err.message);
    return;
  }

  try {
    const dropTables = await readFile('./sql/drop.sql');
    await query(dropTables);
    console.info('Existing tables dropped');
  } catch (err) {
    console.error('Error while dropping tables:', err.message);
    return;
  }

  try {
    const createTables = await readFile('./sql/schema.sql');
    await query(createTables);
    console.info('Database tables created');
  } catch (err) {
    console.error('Error while creating tables:', err.message);
    return;
  }

  try {
    const createData = await readFile('./sql/dummy.sql');
    await query(createData);
    console.info('Dummy user created');
  } catch (err) {
    console.error('Error creating dummy user:', err.message);
    return;
  }

  try {
    await importData();
  } catch (err) {
    console.error('Error importing csv data:', err.message);
  }

  try {
    await cleanYears();
    console.info('Cleaning test year images');
  } catch (err) {
    console.error('Error while removing test year images', err.message);
    return;
  }

  try {
    await cleanBuildings();
    console.info('Cleaning test building images');
  } catch (err) {
    console.error('Error while removing test building images', err.message);
  }
}

teardown().catch((err) => {
  console.error(err);
});
