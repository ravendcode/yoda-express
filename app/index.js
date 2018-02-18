// const fs = require('fs');
// const path = require('path');
// const util = require('util');
const express = require('express');

const app = express();

const routes = require('../config/routes');

routes(app);

module.exports = app;
