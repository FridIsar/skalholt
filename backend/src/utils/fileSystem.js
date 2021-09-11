// File system helpers

import {
  access,
  mkdir,
  writeFile as fsWriteFile,
  readFile as fsReadFile,
  stat as fsStat,
  readdir as fsReadDir,
} from 'fs/promises'; // eslint-disable-line import/no-unresolved
import fs from 'fs';
import csv from 'csv-parser';

/**
 * Provides a stat summary for a file
 *
 * @param {string} file file path
 * @returns the summarized stats
 */
export async function stat(file) {
  let result = null;
  try {
    result = await fsStat(file);
  } catch (err) {
    // unused
  }
  return result;
}

/**
 * Checks whether there is a file at the given path
 *
 * @param {string} file file path
 * @returns true/false
 */
export async function exists(file) {
  let ok = true;
  try {
    await access(file, fs.constants.F_OK);
  } catch (e) {
    ok = false;
  }
  return ok;
}

/**
 * Helper function to check read permissions of a directory
 *
 * @param {string} dir directory path
 * @returns true/false
 */
export async function isReadable(dir) {
  let readable = true;
  try {
    await access(dir, fs.constants.R_OK);
  } catch (err) {
    readable = false;
  }

  return readable;
}

/**
 * Function to fetch the contents of a file as a string
 *
 * @param {string} file file path
 * @param {string} encoding encoding of the file
 * @returns content of the file transformed to a string value
 */
export async function readFile(file, encoding = 'utf8') {
  if (!(await isReadable(file))) {
    return null;
  }

  const content = await fsReadFile(file);

  if (!encoding) {
    return content;
  }

  return content.toString(encoding);
}

/**
 * Function to delete a file at the given path
 *
 * @param {string} file file path
 */
export async function deleteFile(file) {
  fs.unlink((file), (err) => {
    if (err) throw err;
  });
}

/**
 * Function to delete a list of files
 *
 * @param {Object} files the files to delete
 */
export async function deleteFiles(files) {
  for (const file of files) {
    deleteFile(file);
  }
}

/**
 * Function to create a new empty directory
 *
 * @param {string} dir the directory path to create
 */
export async function createDir(dir) {
  await mkdir(dir, { recursive: true });
}

/**
 * Function to create a new file with the given
 * content and encoding
 *
 * @param {string} file file path
 * @param {string} data data to write to the file
 * @param {string} encoding encoding to use
 * @returns async promise ( should be awaited to avoid data loss )
 */
export async function writeFile(
  file,
  data,
  encoding = 'utf8',
) {
  return fsWriteFile(file, data, { encoding });
}

/**
 * Helper function to check write permissions of a directory
 *
 * @param {string} dir the directory path to check
 * @returns true/false
 */
export async function isWriteable(dir) {
  let writeable = true;
  try {
    await access(dir, fs.constants.W_OK);
  } catch (e) {
    writeable = false;
  }

  return writeable;
}

/**
 * Helper function to make sure a directory exists
 * ( Creates one if it does not )
 *
 * @param {string} dir the directory path
 * @returns whether the directory is now writeable
 */
export async function prepareDir(dir) {
  if (!(await exists(dir))) {
    await createDir(dir);
  }
  return isWriteable(dir);
}

/**
 * Helper function to check the contents of a directory
 *
 * @param {string} dir the directory path to check
 * @returns list of contents of the directory
 */
export async function readDir(dir) {
  let results = [];
  try {
    results = await fsReadDir(dir);
  } catch (err) {
    // unused
  }
  return results;
}

/**
 * Helper function to recursively remove a directory and its contents
 *
 * @param {string} dir the directory path
 */
export async function removeDir(dir) {
  fs.rm(dir, { recursive: true }, (err) => {
    console.error(err);
  });
}

/**
 * Helper function to read the contents of a csv as a stream
 *
 * This is mostly used for the initial setup of the database
 *
 * @param {string} file the path to the csv to read
 * @returns contents of a file as a promise ( async )
 */
export async function readStream(file) {
  const data = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on('error', (error) => {
        reject(error);
      })
      .on('data', (item) => data.push(item))
      .on('end', () => {
        resolve(data);
      });
  });
}
