const express = require("express");
const compression = require("compression");
const { authenticatedRouter, unAuthenticatedRouter } = require("./src/routes"); // import routes
const { errorHandler } = require("./src/middleware/errorHandler");
const { authenticate } = require("./src/middleware/authenticate");
const { validateInputs } = require("./src/middleware/validateInput");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.text({ limit: "10mb" }));
app.use(compression());

app.use(errorHandler);

app.use("/api", [authenticate, validateInputs], authenticatedRouter); // authenticated routes
app.use("/", unAuthenticatedRouter); // unAuthenticated routes

// start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
