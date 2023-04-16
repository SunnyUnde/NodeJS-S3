const Users = require("../models/users.json");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../utils");

class Login {
  async login(req, res) {
    const { username, password } = req.body;
    const isUser = Users.find((user) => {
      return user.username === username && user.password === password;
    });
    // Validate the user's credentials
    if (isUser) {
      // Generate a JWT token with an expiration time of 1 hour
      const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  }
}
module.exports = Login;
