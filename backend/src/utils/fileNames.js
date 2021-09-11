const MAJOR_FILE_GROUPS = [
  'buildings',
  'features',
];

export default function validateFileGroup(filename) {
  return MAJOR_FILE_GROUPS.indexOf(filename.toLowerCase()) >= 0;
}
