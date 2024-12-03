
// Get User Profile
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
exports.getProfile = async (req, res) => {
  const token = req.cookies.token; // Get token from cookies

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id; // Get user ID from the decoded token

    // Find the user by ID and exclude password from the response
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user); // Return user data
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};


// exports.updateProfile = async (req, res) => {
//   const token = req.cookies.token; // Get token from cookies

//   if (!token) {
//     return res.status(401).json({ msg: 'No token, authorization denied' });
//   }

//   try {
//     // Verify the token and extract user ID
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.user.id; // Get user ID from the decoded token

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     // Update user details
//     user.name = req.body.name || user.name; // Use existing value if no new value provided
//     user.email = req.body.email || user.email;
//     user.role = req.body.role || user.role;

//     // Check if an image is being uploaded
//     if (req.body.profileImage) {
//       const { profileImage } = req.body;

//       // Assuming the image is sent as a base64 encoded string
//       const buffer = Buffer.from(profileImage.split(",")[1], 'base64'); // Split to remove data URL part
//       user.profilePic = {
//         data: buffer,
//         contentType: req.body.contentType || 'image/png', // Default type if not provided
//       };
//     }

//     await user.save();

//     res.json({ msg: 'Profile updated successfully', user });
//   } catch (err) {
//     console.error('Update profile error:', err);
//     res.status(500).json({ msg: 'Server error' });
//   }
// };
exports.updateProfile = async (req, res) => {
  const token = req.cookies.token; // Get token from cookies

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id; // Get user ID from the decoded token

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update basic user details
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    // Check if profile image is provided
    if (req.body.profileImage) {
      const { profileImage } = req.body; // base64 encoded image string

      // Decode base64 image
      const buffer = Buffer.from(profileImage.split(",")[1], 'base64'); // Remove `data:image/jpeg;base64,` part
      user.profilePic = buffer; // Save only the buffer

      // Optionally, you can store the contentType separately if you need to track it.
      user.profilePicContentType = 'image/jpeg'; // Store contentType (if needed)
    }

    await user.save();

    res.json({
      msg: 'Profile updated successfully',
      user: {
        ...user.toObject(),
        profilePic: user.profilePic
          ? `data:${user.profilePicContentType};base64,${user.profilePic.toString('base64')}`
          : null,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
// User Logout
exports.logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'None', expires: new Date(0), path: '/' });

    // Log the logout action for debugging purposes
    console.log('Logout success: Token cleared.');
    console.log(req.cookies); // Log the cookies to confirm

    // Send a success response
    res.json({ msg: 'Logged out successfully' });

  } catch (err) {
    // Log any errors that occur during the logout process
    console.error('Logout failed:', err);

    // Send a failure response to the client
    res.status(500).json({ msg: 'Logout failed, token not cleared' });
  }
};
