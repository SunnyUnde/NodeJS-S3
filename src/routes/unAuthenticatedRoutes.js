const express = require("express");
const router = express.Router();
const { Login } = require("../controllers");
const login = new Login();

router.post("/login", async (req, res) => {
  await login.login(req, res);
});

module.exports = router;
