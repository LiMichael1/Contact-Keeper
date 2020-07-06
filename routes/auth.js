const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth'); //custom Middleware
const { check, validationResult } = require('express-validator');

const User = require('../models/User'); // User Model for Database

// @route     GET api/auth
// @desc      Get logged in user
// @access    Private
router.get('/', auth, async (req, res) => {
  try {
    // Find User Information based on User Id,  Excludes the password
    const user = await User.findById(req.user.id).select('-password');
    // Send the User Information back
    res.json(user);
  } catch (err) {
    // Can't find the User based on UserId
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route     POST api/auth
// @desc      Auth user & get token
// @access    Public
router.post(
  '/',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      // Check to see if the user exists
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credientials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      // Check if it is the correct password
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credientials' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      // Send WebToken back for Authentication
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//export router
module.exports = router;
