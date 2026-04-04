const express = require('express');
const { registerUser, loginUser, getProfile, updateUserProfile, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { adminCheck } = require('../middleware/adminMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);

// Admin-only: list all users (name, email, role, createdAt — no passwords)
router.get('/users', protect, adminCheck, getUsers);

module.exports = router;
