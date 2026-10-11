const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

router.get('/profile/:id', getUserProfile);
router.put('/profile/:id', updateUserProfile);
router.post('/profile/:id', updateUserProfile);

module.exports = router;