const validateInputs = (req, res, next) => {
  // logic to validate inputs
  const errors = [];

  // if (!req.body.name) {
  //   errors.push("Name is required");
  // }

  if (errors.length > 0) {
    res.status(400).json({ errors });
  } else {
    next();
  }
};

module.exports = { validateInputs };
