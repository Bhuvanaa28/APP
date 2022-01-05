const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller.js');

router.post('/signup', UserController.signup);
router.get('/email_verify',UserController.verify)
router.post('/login', UserController.login);

module.exports = router;