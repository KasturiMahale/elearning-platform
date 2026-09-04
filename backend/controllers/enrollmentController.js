const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const logEvent = require('../utils/logEvent');

// ENROLL in a course
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if already enrolled
    const existing = await Enrollment.findOne({ student: req.user.id, course: courseId });
    if (existing) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = new Enrollment({
      student: req.user.id,
      course: courseId,
    });

    await enrollment.save();
    await logEvent(req.user.id, 'enroll', { courseId });

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// MARK a lesson as complete
exports.completeLesson = async (req, res) => {
  try {
    const { enrollmentId, lessonId } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId).populate('course');
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Add lesson if not already marked complete
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    // Recalculate progress
    const totalLessons = enrollment.course.lessons.length;
    const completedCount = enrollment.completedLessons.length;
    enrollment.progress = Math.round((completedCount / totalLessons) * 100);

    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';
    }

    await enrollment.save();
    await logEvent(req.user.id, 'lesson_complete', { 
    courseId: enrollment.course._id, 
    lessonId 
    });

if (enrollment.status === 'completed') {
  await logEvent(req.user.id, 'course_complete', { courseId: enrollment.course._id });
}

    res.status(200).json({ message: 'Lesson marked complete', enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET my enrollments (for a logged-in student)
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id }).populate('course');
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};