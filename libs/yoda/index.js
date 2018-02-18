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

function info(state, appDir, newFiles, configRoutesFile) {
  switch (state) {
    case 'generateApp':
      console.log('\tAdded:');
      for (const file of newFiles) {
        console.log('\t\t' + path.join(appDir, file));
      }
      console.log('\tModified:');
      console.log(`\t\t${configRoutesFile}`);
      break;
    case 'removeApp':
      console.log('\tRemoved:');
      console.log(`\t\t${appDir}`);
      console.log('\tModified:');
      console.log(`\t\t${configRoutesFile}`);
      break;
    default:
      break;
  }
}

async function addAppToConfigRoutes(configRoutesFile, app) {
  try {
    const data = await readFile(configRoutesFile, 'utf-8');
    const routerText = `  app.use('/${app}', require('../app/${app}/router'));`;
    const lines = data.split('\n');
    const linesLen = lines.length;
    for (let i = 0; i < linesLen; i++) {
      if (new RegExp('\}\;').test(lines[i])) {
        lines.splice(i, 0, routerText);
        await writeFile(configRoutesFile, lines.join('\n'));
        return;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const generateApp = async (app, appsDir, configRoutesFile, newFiles) => {
  const files = await readdir(appsDir);
  for (const file of files) {
    const stats = await lstat(path.join(appsDir, file));
    if (stats.isDirectory() && app === file) {
      throw new Error(`This <app:${app}> already exists.`);
    }
  }
  const newAppDir = path.join(appsDir, app);
  fs.mkdirSync(newAppDir);
  const routerData = `const express = require('express');
const views = require('./views');

const router = express.Router();

router.get('/', views.index);

module.exports = router;\n`;
  const viewsData = `exports.index = (req, res) => {
res.send('Index');
};\n`;
  await writeFile(`${newAppDir}/models.js`, '');
  await writeFile(`${newAppDir}/router.js`, routerData);
  await writeFile(`${newAppDir}/views.js`, viewsData);
  await addAppToConfigRoutes(configRoutesFile, app);
  if (process.env.NODE_ENV !== 'test') {
    console.log(chalk.green(`This <app:${app}> successfully created.`));
    info('generateApp', newAppDir, newFiles, configRoutesFile);
  }
};

async function removeAppFromConfigRoutes(app, configRoutesFile) {
  try {
    const data = await readFile(configRoutesFile, 'utf-8');
    const lines = data.split('\n');
    const linesLen = lines.length;
    for (let i = 0; i < linesLen; i += 1) {
      if (new RegExp('require\\(\'../app/' + app + '/router\'\\)').test(lines[i])) {
        lines.splice(i, 1);
      }
    }
    await writeFile(configRoutesFile, lines.join('\n'));
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

const removeApp = async (app, appsDir, configRoutesFile, newFiles) => {
  // if (app === 'default') {
  //   throw new Error(`This <app:${app}> is default app.`);
  // }
  const files = await readdir(appsDir);
  for (const file of files) {
    const removeFile = path.join(appsDir, file);
    const stats = await lstat(removeFile);
    if (stats.isDirectory() && app === file) {
      await removeFiles(removeFile);
      await removeAppFromConfigRoutes(app, configRoutesFile);
      const rmAppDir = path.join(appsDir, app);
      if (process.env.NODE_ENV !== 'test') {
        console.log(chalk.green(`This <app:${app}> successfully removed.`));
        info('removeApp', rmAppDir, newFiles, configRoutesFile);
      }
      return;
    }
  }
  throw new Error(`This <app:${app}> not exists.`);
};

const actionGenerateApp = (app) => {
  (async () => {
    try {
      await generateApp(app, config.appsDir, config.configRoutesFile, config.newFiles);
      process.exit();
    } catch (e) {
      console.error(chalk.red(e.message));
    }
  })();
};

const actionRemoveApp = (app) => {
  (async () => {
    try {
      await removeApp(app, config.appsDir, config.configRoutesFile, config.newFiles);
      process.exit();
    } catch (e) {
      console.error(chalk.red(e.message));
    }
  })();
};

module.exports = {
  generateApp,
  removeApp,
  actionGenerateApp,
  actionRemoveApp,
};
