const path = require('path');

const rootDir = path.join(__dirname, '../../');
const resourcesDir = path.join(rootDir, './api/resources');
const apiIndexFile = path.join(rootDir, './api/index.js');

module.exports = {
  rootDir,
  resourcesDir,
  apiIndexFile,
};
