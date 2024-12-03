const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const  protect  = require('../middleware/auth'); 

// Get all available jobs (GET /api/jobs)
router.get('/jobs', protect, jobController.getAvailableJobs);

router.get('/jobs/assigned', protect, jobController.getAssignedJobs);

// Apply for a job (POST /api/jobs/apply)
router.post('/jobs/apply', protect, jobController.applyForJob);

// Get all completed jobs (GET /api/jobs/completed)
router.get('/jobs/completed', protect, jobController.getCompletedJobs);

// Create a new job (POST /api/jobs) - only accessible by admin
router.post('/jobs', protect, jobController.createJob)

router.post('/jobs/completed', protect, jobController.completeJob);



module.exports = router;
