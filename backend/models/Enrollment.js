const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId, // refers to a specific lesson's _id inside the course
  }],
  progress: {
    type: Number, // percentage, 0-100
    default: 0,
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress',
  },
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);