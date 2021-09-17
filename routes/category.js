/* NODE-MODULES */
const express = require('express');
const router = express.Router();
// var auth = require("../lib/auth");
const { check, validationResult, body } = require('express-validator');
const moment = require('moment')
var auth = require("../lib/auth");

/* CONTROLLER MODULES */
const categoryController = require('../controllers/category');

router.get('/', categoryController.all);
router.get('/allList', categoryController.categoryTotal);
router.get('/article/:id', categoryController.byId);
router.get('/:slug', categoryController.bySlug);
router.post('/', [
    check('name', 'Name is required').notEmpty(),
    check('slug', 'Slug is required').notEmpty(),
], [auth.authenticateUser], categoryController.create);

router.put('/', [
    check('category_id', 'Category id is required').notEmpty(),
], [auth.authenticateUser], categoryController.update);

router.delete('/:id', [auth.authenticateUser], categoryController.remove);

module.exports = router;