// controllers/ScheduleController.js

const Schedule = require('../models/Schedule');

// Set or update the cleaner's schedule
exports.setSchedule = async (req, res) => {
  try {
    const { day, startTime, endTime } = req.body;
    const userId = req.user.id; // Assumes you have middleware to decode user ID from token

    // Check if a schedule exists for this user and day
    let schedule = await Schedule.findOne({ user: userId, day });

    if (schedule) {
      // Update existing schedule
      schedule.startTime = startTime;
      schedule.endTime = endTime;
      await schedule.save();
    } else {
      // Create a new schedule
      schedule = new Schedule({ user: userId, day, startTime, endTime });
      await schedule.save();
    }

    res.json({ msg: 'Schedule saved successfully', schedule });
  } catch (err) {
    console.error('Error saving schedule:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Retrieve the cleaner's schedule
exports.getSchedule = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes you have middleware to decode user ID from token
    const schedule = await Schedule.find({ user: userId });

    if (!schedule) {
      return res.status(404).json({ msg: 'No schedule found' });
    }

    res.json({ schedule });
  } catch (err) {
    console.error('Error retrieving schedule:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAllSchedules = async (req, res) => {
  try {
    // Optionally, we can filter schedules by user if the admin is checking specific cleaner schedules
    const schedules = await Schedule.find()
      .populate('user', 'name email')  // Populate user info (name, email)
      .sort({ createdAt: -1 });  // Sorting by createdAt, latest first

    return res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error, unable to fetch schedules.'
    });
  }
};