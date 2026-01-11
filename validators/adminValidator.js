const { header, body } = require("express-validator");

exports.adminLoginValidator = [
  header("userName")
    .notEmpty()
    .withMessage("userName is required")
    .isLength({ min: 3 })
    .withMessage("userName must be at least 3 characters long"),

  header("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),
];
exports.adminRegisterValidator = [
  body("userName")
    .notEmpty()
    .withMessage("userName is required")
    .isLength({ min: 3 })
    .withMessage("userName must be at least 3 characters long"),

  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),
];
