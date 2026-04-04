const express = require('express');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { adminCheck } = require('../middleware/adminMiddleware');

const router = express.Router();

// All category routes require a valid JWT (protect) and admin role (adminCheck)
router.get('/',     protect, adminCheck, getCategories);
router.get('/:id',  protect, adminCheck, getCategory);
router.post('/',    protect, adminCheck, createCategory);
router.put('/:id',  protect, adminCheck, updateCategory);
router.delete('/:id', protect, adminCheck, deleteCategory);

module.exports = router;
