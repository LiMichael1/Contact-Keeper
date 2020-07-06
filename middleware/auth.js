// Middleware has access to request and response cycle and objects
// Protects Private Routes from Non-Authenticated Users

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  // Get Token from the header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(400).json({ msg: 'No Token, authorization denied' });
  }

  try {
    // Check if correct secret
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    // Put Valid Authorizated User in the Request Body
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
