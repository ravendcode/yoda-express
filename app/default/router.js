const express = require('express');
const views = require('./views');

const router = express.Router();

router.get('/', views.index);

module.exports = router;
