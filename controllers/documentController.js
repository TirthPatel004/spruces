const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');// Adjust the path to your Document model
const User = require('../models/User'); //
// Set up storage engine for multer (upload to assets/uploadpdf)
const auth = require('../middleware/auth'); 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../assets/uploadpdf/'); // Path to your upload folder
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Destination folder for uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to avoid name collisions
  },
});

const upload = multer({ storage: storage });

// Upload Document
// exports.uploadDocument = async (req, res) => {
//   try {
//     console.log('Request body:', req.body); // Log request body
//     console.log('Uploaded file:', req.file); // Log uploaded file

//     const { documentName } = req.body; // Extract documentName from the request body

//     if (!documentName) {
//       return res.status(400).json({ msg: 'Document name is required' }); // Validate presence of documentName
//     }

//     const user = req.user ? req.user._id : 'Unknown User'; // Assuming user ID is added to `req.user` by auth middleware

//     if (!req.file) {
//       return res.status(400).json({ msg: 'No document uploaded' });
//     }

//     // Create a new document record with the file path
//     const newDocument = new Document({
//       user,
//       documentName,
//       filePath: `/assets/uploadpdf/${req.file.filename}`, // Save the relative file path
//     });

//     // Save the document to the database
//     await newDocument.save();

//     res.status(201).json({
//       msg: 'Document uploaded successfully',
//       document: newDocument,
//     });
//   } catch (err) {
//     console.error('Error uploading document:', err);
//     res.status(500).json({ msg: 'Failed to upload document' });
//   }
// };



// exports.uploadDocument = async (req, res) => {
//   try {
//     // Extract the token from the cookies
//     const token = req.cookies.token; // Get token from cookies

//     if (!token) {
//       return res.status(401).json({ msg: 'No token, authorization denied' });
//     }

//     // Verify the token and extract user ID
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.user.id; // Get user ID from the decoded token

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     console.log('Request body:', req.body); // Log request body
//     console.log('Uploaded file:', req.file); // Log uploaded file

//     const { documentName } = req.body; // Extract documentName from the request body

//     if (!documentName) {
//       return res.status(400).json({ msg: 'Document name is required' }); // Validate presence of documentName
//     }

//     if (!req.file) {
//       return res.status(400).json({ msg: 'No document uploaded' });
//     }

//     // Create a new document record with the file path
//     const newDocument = new Document({
//       user: userId, // Save the user ID
//       documentName,
//       filePath: `/assets/uploadpdf/${req.file.filename}`, // Save the relative file path
//     });

//     // Save the document to the database
//     await newDocument.save();

//     res.status(201).json({
//       msg: 'Document uploaded successfully',
//       document: newDocument,
//     });
//   } catch (err) {
//     console.error('Error uploading document:', err);
//     res.status(500).json({ msg: 'Failed to upload document' });
//   }
// };

exports.uploadDocument = [
  auth, 
  async (req, res) => {
    try {
      // The user ID is automatically attached to the request by the auth middleware
      const userId = req.user._id;

      console.log('Request body:', req.body); // Log request body
      console.log('Uploaded file:', req.file); // Log uploaded file

      const { documentName } = req.body; // Extract documentName from the request body

      // Validate the presence of documentName and file
      if (!documentName) {
        return res.status(400).json({ msg: 'Document name is required' });
      }

      if (!req.file) {
        return res.status(400).json({ msg: 'No document uploaded' });
      }

      // Create a new document record with the file path
      const newDocument = new Document({
        user: userId, // Save the user ID
        documentName,
        filePath: `/assets/uploadpdf/${req.file.filename}`, // Save the relative file path
      });

      // Save the document to the database
      await newDocument.save();

      res.status(201).json({
        msg: 'Document uploaded successfully',
        document: newDocument,
      });
    } catch (err) {
      console.error('Error uploading document:', err);
      res.status(500).json({ msg: 'Failed to upload document' });
    }
  },
];


// Retrieve Documents for the authenticated user
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id }); // Get documents for the authenticated user
    res.status(200).json({ documents });
  } catch (err) {
    console.error('Error retrieving documents:', err);
    res.status(500).json({ msg: 'Failed to retrieve documents' });
  }
};

// Retrieve All Documents (for admin or other purposes)
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find(); // Get all documents in the system
    res.status(200).json({ documents });
  } catch (err) {
    console.error('Error retrieving all documents:', err);
    res.status(500).json({ msg: 'Failed to retrieve all documents' });
  }
};

// Retrieve a document by its ID (and send the file path for download)
exports.getDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params; // Get document ID from URL parameter
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Send the document file as a download (file path is saved in the database)
    const filePath = path.join(__dirname, '..', document.filePath); // Resolve the file path on the server

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending document file:', err);
        res.status(500).json({ msg: 'Failed to retrieve document file' });
      }
    });
  } catch (err) {
    console.error('Error retrieving document:', err);
    res.status(500).json({ msg: 'Failed to retrieve document' });
  }
};
