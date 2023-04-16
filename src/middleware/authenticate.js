const jwt = require("jsonwebtoken");
const { secretKey } = require("../utils");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication token not provided" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded.username;

    next();
  } catch (err) {
    console.error("Authentication Error", err);
    return res
      .status(401)
      .json({ message: "Invalid or expired authentication token" });
  }
};

module.exports = { authenticate };
