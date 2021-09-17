/* NODE-MODULES */
const express = require('express');
const router = express.Router();
var auth = require("../lib/auth");
const { check, validationResult, body } = require('express-validator');
const moment = require('moment')
const multer = require('multer');
const DIR = './public/uploads/';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, DIR)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

var upload = multer({ storage: storage });

/* CONTROLLER MODULES */
const newsController = require('../controllers/news');

router.get('/', newsController.all);
router.get('/:id', newsController.byId);
router.get('/article/:slug', newsController.bySlug);
router.post('/', [
    check('title', 'Title is required').notEmpty(),
    check('slug', 'Slug is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('author_id', 'Author is required').notEmpty(),
], [auth.authenticateUser], upload.single('image'), newsController.create);

router.put('/', [
    check('_id', 'Post id is required').notEmpty(),
    check('author_id', 'Author is required').notEmpty(),
], [auth.authenticateUser], upload.single('image'), newsController.update);

router.delete('/:id', [auth.authenticateUser], newsController.remove);

router.get('/search/:searchtext', newsController.newsSearch);
router.get('/trending/news', newsController.trendingNews);

module.exports = router;