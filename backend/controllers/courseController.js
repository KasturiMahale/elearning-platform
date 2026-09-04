const logEvent = require('../utils/logEvent');
const Course = require('../models/Course');

// CREATE a course (instructor only)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, price, lessons } = req.body;

    const newCourse = new Course({
      title,
      description,
      category,
      price,
      lessons,
      instructor: req.user.id, // comes from auth middleware (we'll add this next)
    });

    await newCourse.save();
    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'name email');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user) {
      await logEvent(req.user.id, 'course_view', { courseId: course._id });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};