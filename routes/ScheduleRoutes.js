
const express = require('express');
const router = express.Router();
const ScheduleController = require('../controllers/ScheduleController');
const authMiddleware = require('../middleware/auth'); // Ensure this checks for authenticated users
const authenticateUser  = require('../middleware/auth');
// Set or update schedule
router.put('/api/profile/schedule', authMiddleware, ScheduleController.setSchedule);

// Get schedule
router.get('/api/profile/schedule', authMiddleware, ScheduleController.getSchedule);

router.get('/api/getallschedules', ScheduleController.getAllSchedules);


module.exports = router;
