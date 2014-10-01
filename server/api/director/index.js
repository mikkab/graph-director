'use strict';

var express = require('express');
var controller = require('./director.controller');

var router = express.Router();

router.get('/director/:name', controller.get_director);
router.delete('/director/:name', controller.invalidate_director);
router.get('/directors', controller.get_directors);
router.delete('/directors', controller.invalidate_directors);
router.get('/directors/top', controller.get_top_directors);
router.delete('/directors/top', controller.invalidate_top_directors);

module.exports = router;
