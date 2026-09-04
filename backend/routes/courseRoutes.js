const express = require('express');
const router = express.Router();
const { createCourse, getAllCourses, getCourseById } = require('../controllers/courseController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createCourse); // only logged-in users can create
router.get('/', getAllCourses); // anyone can view all courses
router.get('/:id', getCourseById); // anyone can view a single course

module.exports = router;