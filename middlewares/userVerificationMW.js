const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.params.verificationToken;
  if (!token) {
    const error = new Error("Failed to verify.");
    error.statusCode = 401;
    throw error;
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET_KEY);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Failed to verify.");
    error.statusCode = 401;
    throw error;
  }
  req.verifyEmail = decodedToken.verifyEmail;
  next();
};
