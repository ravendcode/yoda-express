/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const chalk = require('chalk');

const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const readFile = promisify(fs.readFile);

const config = require('./config');

function info(state, resourceDir, newFiles, apiIndexFile) {
  switch (state) {
    case 'generateResource':
      console.log('\tAdded:');
      for (const file of newFiles) {
        console.log('\t\t' + path.join(resourceDir, file));
      }
      console.log('\tModified:');
      console.log(`\t\t${apiIndexFile}`);
      break;
    case 'removeResource':
      console.log('\tRemoved:');
      console.log(`\t\t${resourceDir}`);
      console.log('\tModified:');
      console.log(`\t\t${apiIndexFile}`);
      break;
    default:
      break;
  }
}

async function addResourceToAPI(apiIndexFile, resource) {
  try {
    const data = await readFile(apiIndexFile, 'utf-8');
    const routerText = `router.use('/${resource}', require('./resources/${resource}'));`;
    const lines = data.split('\n');
    const linesLen = lines.length;
    for (let i = 0; i < linesLen; i++) {
      if (new RegExp('module.exports = router;').test(lines[i])) {
        lines.splice(--i, 0, routerText);
        await writeFile(apiIndexFile, lines.join('\n'));
        return;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const generateResource = async (resource, resourcesDir, apiIndexFile) => {
  const files = await readdir(resourcesDir);
  for (const file of files) {
    const stats = await lstat(path.join(resourcesDir, file));
    if (stats.isDirectory() && resource === file) {
      throw new Error(`This <resource:${resource}> already exists.`);
    }
  }
  const newResourceDir = path.join(resourcesDir, resource);
  fs.mkdirSync(newResourceDir);
  const indexData = `module.exports = require('./${resource}.router');\n`;
  const routerData = `const express = require('express');
const handler = require('./user.handler');

const router = express.Router();

router.param('id', handler.findByParam);

router.route('/')
  .get(handler.getAll)
  .post(handler.createOne);

router.route('/:id')
  .get(handler.getOne)
  .put(handler.updateOne)
  .delete(handler.deleteOne);

module.exports = router;\n`;
  const handlerData = `module.exports = {
  findByParam(req, res, next, id) {
    if (!id) {
      return next(new Error('Not Found Error'));
    }
    req.id = id;
    return next();
  },
  getAll(req, res) {
    res.send({ data: 'getAll' });
  },
  createOne(req, res) {
    res.send({ data: 'createOne', body: req.body });
  },
  getOne(req, res) {
    res.send({ data: 'getOne', param: req.id });
  },
  updateOne(req, res) {
    res.send({ data: 'updateOne', param: req.id, body: req.body });
  },
  deleteOne(req, res) {
    res.send({ data: 'deleteOne', param: req.id });
  },
};\n`;
  const indexFile = 'index.js';
  const specFile = `${resource}.spec.js`;
  const modelFile = `${resource}.model.js`;
  const handlerFile = `${resource}.handler.js`;
  const routerFile = `${resource}.router.js`;
  const newFiles = [];
  newFiles.push(indexFile);
  newFiles.push(specFile);
  newFiles.push(modelFile);
  newFiles.push(handlerFile);
  newFiles.push(routerFile);
  await writeFile(`${newResourceDir}/${indexFile}`, indexData);
  await writeFile(`${newResourceDir}/${specFile}`, '');
  await writeFile(`${newResourceDir}/${modelFile}`, '');
  await writeFile(`${newResourceDir}/${handlerFile}`, handlerData);
  await writeFile(`${newResourceDir}/${routerFile}`, routerData);
  await addResourceToAPI(apiIndexFile, resource);
  if (process.env.NODE_ENV !== 'test') {
    console.log(chalk.green(`This <resource:${resource}> successfully created.`));
    info('generateResource', newResourceDir, newFiles, apiIndexFile);
  }
};

async function removeResourceFromAPI(resource, apiIndexFile) {
  try {
    const data = await readFile(apiIndexFile, 'utf-8');
    const lines = data.split('\n');
    const linesLen = lines.length;
    for (let i = 0; i < linesLen; i += 1) {
      if (new RegExp('require\\(\'\.\/resources\/' + resource + '\'\\)').test(lines[i])) {
        lines.splice(i, 1);
      }
    }
    await writeFile(apiIndexFile, lines.join('\n'));
  } catch (e) {
    console.error(e);
  }
}

async function removeFiles(file) {
  const delFiles = await readdir(file);
  for (const delFile of delFiles) {
    const delStats = await lstat(file + '/' + delFile);
    if (delStats.isFile()) {
      await unlink(file + '/' + delFile);
    } else {
      await removeFiles(file + '/' + delFile);
    }
  }
  await rmdir(file);
}

const removeResource = async (resource, resourcesDir, apiIndexFile) => {
  const files = await readdir(resourcesDir);
  for (const file of files) {
    const removeFile = path.join(resourcesDir, file);
    const stats = await lstat(removeFile);
    if (stats.isDirectory() && resource === file) {
      await removeFiles(removeFile);
      await removeResourceFromAPI(resource, apiIndexFile);
      const rmResourceDir = path.join(resourcesDir, resource);
      if (process.env.NODE_ENV !== 'test') {
        console.log(chalk.green(`This <resource:${resource}> successfully removed.`));
        info('removeResource', rmResourceDir, [], apiIndexFile);
      }
      return;
    }
  }
  throw new Error(`This <resource:${resource}> not exists.`);
};

const actionGenerateResource = (resource) => {
  (async () => {
    try {
      await generateResource(resource, config.resourcesDir, config.apiIndexFile);
      process.exit();
    } catch (e) {
      console.error(chalk.red(e.message));
    }
  })();
};

const actionRemoveResource = (resource) => {
  (async () => {
    try {
      await removeResource(resource, config.resourcesDir, config.apiIndexFile);
      process.exit();
    } catch (e) {
      console.error(chalk.red(e.message));
    }
  })();
};

module.exports = {
  generateResource,
  removeResource,
  actionGenerateResource,
  actionRemoveResource,
};
