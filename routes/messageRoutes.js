const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');  // Middleware for authentication
const MessageController = require('../controllers/messageController');

// Send message from cleaner to admin
router.post('/api/messages', authMiddleware, MessageController.sendMessage);

// Retrieve messages between cleaner and admin
router.get('/api/messages', authMiddleware, MessageController.getMessages);


router.get('/api/chats', MessageController.getChatList);

module.exports = router;
