const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'signup',
      'login',
      'course_view',
      'enroll',
      'lesson_start',
      'lesson_complete',
      'course_complete',
    ],
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // flexible field, can hold any extra info
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);