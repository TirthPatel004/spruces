const Job = require('../models/Job');
const User = require('../models/User'); // For user validation

// Create a new job (only accessible by admin)
exports.createJob = async (req, res) => {
  try {
    const { title, description, location, scheduledDate } = req.body;

    // Ensure the logged-in user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Only admins can create jobs.' });
    }

    // Create a new job
    const newJob = new Job({
      title,
      description,
      location,
      scheduledDate,
      status: 'Available',  // Initially set to 'Available'
    });

    await newJob.save();

    return res.status(201).json({ msg: 'Job created successfully', job: newJob });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ msg: 'Failed to create job' });
  }
};
// Get all available jobs
exports.getAvailableJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Available' })
      .populate('cleaner', 'name email');  // Populate cleaner info for the job

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ msg: 'No available jobs found' });
    }

    res.json({ jobs });
  } catch (err) {
    console.error('Error fetching available jobs:', err);
    res.status(500).json({ msg: 'Failed to retrieve jobs' });
  }
};

exports.getAssignedJobs = async (req, res) => {
  console.log('Request received at:', req.originalUrl);
  try {
    // Find jobs with status 'Assigned' and populate the cleaner's information
    
    const jobs = await Job.find({ status: 'Assigned' })
      .populate('cleaner', 'name email');  // Populate cleaner info

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ msg: 'No assigned jobs found' });
    }

    // Return the list of assigned jobs
    res.json({ jobs });
  } catch (err) {
    console.error('Error fetching assigned jobs:', err);
    res.status(500).json({ msg: 'Failed to retrieve assigned jobs' });
  }
};
// Apply for a specific job
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const cleanerId = req.user.id; // Get the logged-in cleaner's ID

    // Find the job by ID
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if the job is available
    if (job.status !== 'Available') {
      return res.status(400).json({ msg: 'Job is not available for application' });
    }

    // Assign the cleaner to the job
    job.cleaner = cleanerId;
    job.status = 'Assigned'; // Update the job status to 'Assigned'
    await job.save();

    res.status(200).json({ msg: 'Job successfully applied for', job });
  } catch (err) {
    console.error('Error applying for job:', err);
    res.status(500).json({ msg: 'Failed to apply for job' });
  }
};

// Get completed job tasks and job history
exports.getCompletedJobs = async (req, res) => {
  try {
    const cleanerId = req.user.id; // Get the logged-in cleaner's ID

    // Retrieve all completed jobs for the logged-in cleaner
    const jobs = await Job.find({ cleaner: cleanerId, status: 'Completed' })
      .populate('cleaner', 'name email');  

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ msg: 'No completed jobs found' });
    }

    res.json({ jobs });
  } catch (err) {
    console.error('Error fetching completed jobs:', err);
    res.status(500).json({ msg: 'Failed to retrieve completed jobs' });
  }
};



// Complete a job (POST /api/jobs/completed)
exports.completeJob = async (req, res) => {
  try {
    const { jobId } = req.body; // The job ID to be completed
    const userId = req.user.id; // The logged-in user's ID

    // Find the job by ID
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if the job is assigned
    if (job.status !== 'Assigned') {
      return res.status(400).json({ msg: 'Job must be assigned before it can be completed' });
    }

    // Check if the logged-in user is the assigned cleaner or an admin
    if (job.cleaner.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'You are not authorized to complete this job' });
    }

    // Update the job status to 'Completed'
    job.status = 'Completed';
    await job.save();

    return res.status(200).json({ msg: 'Job marked as completed', job });
  } catch (err) {
    console.error('Error completing job:', err);
    res.status(500).json({ msg: 'Failed to complete the job' });
  }
};

