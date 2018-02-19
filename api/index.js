const express = require('express');

const router = express.Router({ mergeParams: true });

router.use('/user', require('./resources/user'));

module.exports = router;
