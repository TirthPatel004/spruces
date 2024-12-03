const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueType: { type: String, required: true },  // e.g., 'Job Assignment', 'Payment'
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
  reportedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', IssueSchema);
