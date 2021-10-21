// Simple helpers to check which major groups to apply to a file

const NON_FIND_GROUPS = [
  'units',
  'samples',
  'buildings',
];

/**
 * Helper function to check whether there is a major file group for the file
 *
 * @param {string} filename the filename to check
 * @returns true/false
 */
export default function validateFileGroup(filename) {
  return NON_FIND_GROUPS.indexOf(filename.toLowerCase()) >= 0;
}
