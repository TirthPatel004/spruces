const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');


// Send a message from the cleaner to the admin, or vice versa
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, messageContent } = req.body;
    const senderId = req.user.id; // Get the logged-in user's ID from the JWT token

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(400).json({ msg: 'Receiver does not exist.' });
    }

    // Ensure the sender is either a cleaner or admin, and receiver is the opposite (i.e., cleaner <-> admin)
    const senderRole = req.user.role;
    const receiverRole = receiver.role;

    if (senderRole === receiverRole) {
      return res.status(400).json({ msg: 'Sender and receiver cannot have the same role.' });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      messageContent,
    });

    await message.save();
    return res.status(201).json({ msg: 'Message sent successfully', message });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ msg: 'Failed to send message' });
  }
};
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;  // The logged-in user's ID

    // Check if the user is an admin or a cleaner
    const role = req.user.role;

    let messages;
    if (role === 'admin') {
      // Admin can see messages where they are the receiver or the sender
      messages = await Message.find({
        $or: [
          { receiver: userId },  // Admin as receiver
          { sender: userId }     // Admin as sender
        ]
      })
        .populate('sender', 'name email')  // Populate sender's name and email
        .populate('receiver', 'name email');  // Populate receiver's name and email
    } else if (role === 'cleaner') {
      // Cleaner can see messages where they are the receiver or the sender
      messages = await Message.find({
        $or: [
          { receiver: userId },  // Cleaner as receiver
          { sender: userId }     // Cleaner as sender
        ]
      })
        .populate('sender', 'name email')  // Populate sender's name and email
        .populate('receiver', 'name email');  // Populate receiver's name and email
    }

    if (!messages || messages.length === 0) {
      return res.status(404).json({ msg: 'No messages found' });
    }

    res.json({ messages });
  } catch (err) {
    console.error('Failed to retrieve messages', err);
    res.status(500).json({ msg: 'Failed to retrieve messages' });
  }
};

exports.getChatList = async (req, res) => {
  try {
    const receiverId = '6729b0009fdc3c0fe4c0fc59'; // The fixed receiver ID

    // Use 'new' to correctly create ObjectId
    const chatList = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(receiverId) },  // Use 'new'
            { receiver: new mongoose.Types.ObjectId(receiverId) }  // Use 'new'
          ]
        }
      },
      {
        $sort: { sentAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(receiverId)] },  // Use 'new'
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$messageContent' },
          sentAt: { $first: '$sentAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          lastMessage: 1,
          sentAt: 1,
          'userInfo.name': 1,
          'userInfo.email': 1
        }
      },
      {
        $sort: { sentAt: -1 }
      }
    ]);

    res.status(200).json({ chatList });
  } catch (err) {
    console.error('Error retrieving chat list:', err);
    res.status(500).json({ msg: 'Failed to retrieve chat list' });
  }
};

