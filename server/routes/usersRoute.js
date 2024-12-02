const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController.js');

router.get('/users/:id/:username', usersController.getUserProfile);
router.post('/register', usersController.register);
router.post('/login', usersController.login)
router.delete('/logout', usersController.logut)

module.exports = router;
