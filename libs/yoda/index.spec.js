/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { assert } = require('chai');
// const { promisify } = require('util');
const yoda = require('../yoda');
const yodaConfig = require('./config');

describe('libs/yoda', () => {
  const app = 'bob43535';
  describe('generateApp()', () => {
    afterEach(async () => {
      await yoda.removeApp(app, yodaConfig.appsDir, yodaConfig.configRoutesFile, yodaConfig.newFiles);
    });
    it('should create dir with specific app name', async () => {
      await yoda.generateApp(app, yodaConfig.appsDir, yodaConfig.configRoutesFile, yodaConfig.newFiles);
      assert.isOk(fs.existsSync(path.resolve(yodaConfig.appsDir, app)));
    });
  });
  describe('removeApp()', () => {
    beforeEach(async () => {
      await yoda.generateApp(app, yodaConfig.appsDir, yodaConfig.configRoutesFile, yodaConfig.newFiles);
    });
    it('should remove dir with specific app name', async () => {
      await yoda.removeApp(app, yodaConfig.appsDir, yodaConfig.configRoutesFile, yodaConfig.newFiles);
      assert.isNotOk(fs.existsSync(path.resolve(yodaConfig.appsDir, app)));
    });
  });
});
