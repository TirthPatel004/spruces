const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },  // e.g., 'Monday'
  startTime: { type: String, required: true },  // e.g., '08:00 AM'
  endTime: { type: String, required: true },  // e.g., '04:00 PM'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
