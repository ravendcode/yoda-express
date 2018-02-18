const path = require('path');

const rootDir = path.join(__dirname, '../../');
const appsDir = path.join(rootDir, 'app');
const configRoutesFile = path.join(rootDir, 'config/routes.js');

const newFiles = [
  'models.js',
  'router.js',
  'views.js',
];

module.exports = {
  rootDir,
  appsDir,
  configRoutesFile,
  newFiles,
};
