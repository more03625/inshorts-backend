const express = require('express');
const { signup, signin, signout, register, login } = require('../controllers/auth');
const { check, body, checkSchema } = require('express-validator');
const { userSignupValidator } = require('../validator');
const router = express.Router();
var auth = require("../lib/auth");

// router.post('/signup',checkSchema(userSignupValidator),signup);
// router.post('/signin',signin);
// router.get('/signout',signout);

router.post('/login', login);
router.post('/register', [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Email Id is required').notEmpty(),
    check('user_password', 'Password is required').notEmpty(),
], register);

module.exports = router;