const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Bypass authentication for demonstration purposes
  req.user = { id: 1, name: "Admin User", email: "admin@leadflow.com" };
  next();
};
