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
const authorController = require('../controllers/author');

// router.get('/', authorController.all);
router.get('/id/:id', authorController.byId);
router.get('/:name', authorController.byAuthor);

module.exports = router;