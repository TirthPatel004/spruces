// routes/auth.js
const express = require('express');
const { register, login, getRole, deleteAccount } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/role', getRole);
router.delete('/delete-account', deleteAccount);
module.exports = router;
