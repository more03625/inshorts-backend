const express = require('express');
const { isAuth } = require('../controllers/auth');
const { userById, read, userId, userFollow} = require('../controllers/user');
const router = express.Router();
var auth = require("../lib/auth");

// router.get('/user/:userId',requireSignin,isAuth,read)
// router.param('userId', [auth.authenticateUser],userById);

router.get('/user/:id', [auth.authenticateUser], userId)
router.post('/user-follow/', [auth.authenticateUser], userFollow)

module.exports = router;