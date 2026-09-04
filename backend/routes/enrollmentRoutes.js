const express = require('express');
const router = express.Router();
const { enrollInCourse, completeLesson, getMyEnrollments } = require('../controllers/enrollmentController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, enrollInCourse);
router.post('/complete-lesson', protect, completeLesson);
router.get('/my', protect, getMyEnrollments);

module.exports = router;