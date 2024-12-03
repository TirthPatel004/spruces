const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'cleaner'],
    default: 'cleaner', 
  },
  profilePic: {
    type: Buffer,  // Use Buffer to store the image as binary data (Blob)
    contentType: String,  // Store the type of image (e.g., 'image/png', 'image/jpeg')
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);

