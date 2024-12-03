const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  uploadDocument, 
  getDocuments, 
  getDocumentById, 
  getAllDocuments 
} = require('../controllers/documentController');
const auth = require('../middleware/auth'); // Use the same auth middleware for consistency

const router = express.Router();
const Document = require('../models/Document'); 
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../assets/uploadpdf');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Create unique file name
  },
});

const upload = multer({ storage });

// Routes
router.post('/upload-documents', auth, upload.single('document'), uploadDocument);
router.get('/documents', auth, getDocuments);
router.get('/document/:documentId', auth, getDocumentById);
router.get('/alldocuments', auth, getAllDocuments);

// Specific route for fetching user-specific documents
router.get('/user/documents', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    const userId = req.user._id; 
    const documents = await Document.find({ user: userId }).sort({ uploadedAt: -1 });
    res.status(200).json({ documents });
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({ msg: 'Error fetching user documents' });
  }
});

module.exports = router;
