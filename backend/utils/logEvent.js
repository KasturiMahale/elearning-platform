const Event = require('../models/Event');

const logEvent = async (userId, eventType, metadata = {}) => {
  try {
    await Event.create({ user: userId, eventType, metadata });
  } catch (error) {
    console.log('Event logging error:', error.message);
  }
};

module.exports = logEvent;