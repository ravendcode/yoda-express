/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { assert } = require('chai');
const yoda = require('../yoda');
const yconfig = require('./config');

describe('libs/yoda', () => {
  const resource = 'bob43535';
  describe('generateResource()', () => {
    afterEach(async () => {
      await yoda.removeResource(resource, yconfig.resourcesDir, yconfig.apiIndexFile);
    });
    it('should create dir with specific resource name', async () => {
      await yoda.generateResource(resource, yconfig.resourcesDir, yconfig.apiIndexFile);
      assert.isOk(fs.existsSync(path.resolve(yconfig.resourcesDir, resource)));
    });
  });
  describe('removeResource()', () => {
    beforeEach(async () => {
      await yoda.generateResource(resource, yconfig.resourcesDir, yconfig.apiIndexFile);
    });
    it('should remove dir with specific resource name', async () => {
      await yoda.removeResource(resource, yconfig.resourcesDir, yconfig.apiIndexFile);
      assert.isNotOk(fs.existsSync(path.resolve(yconfig.resourcesDir, resource)));
    });
  });
});
