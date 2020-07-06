const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../models/User'); // User Model for Database

// @route     POST api/users
// @desc      Register a user
// @access    Public
router.post(
  '/',
  [
    // User Creation Validation Check
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // Check for Errors
    if (!errors.isEmpty()) {
      // Returns all the errors in the Res
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if Email already exists
      let user = await User.findOne({ email });

      // User exists
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // New User
      user = new User({
        name,
        email,
        password,
      });

      // Generate Salt for the Hash
      const salt = await bcrypt.genSalt(10);

      // Hash the Password
      user.password = await bcrypt.hash(password, salt);

      // Save in the Database
      await user.save();

      // Response payload
      const payload = {
        user: {
          id: user.id,
        },
      };

      // Sends back a web token to authenticate user
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
