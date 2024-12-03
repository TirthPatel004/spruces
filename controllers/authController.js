const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password, role: role || 'cleaner' });

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Return JWT token and set it in a cookie
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('JWT sign error:', err);
        return res.status(500).json({ msg: 'Server error' });
      }

      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,  // Prevents JavaScript access to the cookie
        secure: false, // Set to true in production
        maxAge: 3600000, // 1 hour
      });
      
      res.json({ msg: 'User registered successfully' });
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
   console.log(req.cookies);
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    // Return JWT token and set it in a cookie
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('JWT sign error:', err);
        return res.status(500).json({ msg: 'Server error' });
      }

      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure :false,
        maxAge: 3600000,
      });
      console.log(token);
      res.json({ msg: 'User logged in successfully' });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.getRole = async (req, res) => {
  try {
    // Get the token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the decoded ID (from the token)
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Return the role of the user
    res.json({ role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }

};
// Delete User Account
exports.deleteAccount = async (req, res) => {
  try {
    // Get the token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the decoded ID (from the token)
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Delete the user
    await user.remove();

    // Clear the cookie after deletion
    res.clearCookie('token', { httpOnly: true });

    // Send response
    res.json({ msg: 'User account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
