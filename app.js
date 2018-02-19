// const fs = require('fs');
// const path = require('path');
// const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./config/routes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

routes(app);

module.exports = app;
