const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // could be text, or a video URL
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 0,
  },
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  price: {
    type: Number,
    default: 0,
  },
  lessons: [lessonSchema],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);