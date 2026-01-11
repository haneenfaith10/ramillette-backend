const { body, header } = require("express-validator");

exports.registerValidation = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("First name must contain only letters and spaces")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  body("lastName")
    .optional()
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Last name must contain only letters and spaces"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

exports.loginValidation = [
  header("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email address"),

  header("password").notEmpty().withMessage("Password is required"),
];

exports.getUserDetailsValidation = [
  header("userid")
    .exists()
    .withMessage("userid header is required")
    .isMongoId()
    .withMessage("Invalid userid format"),
];

exports.addAddressValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid"),

  body("phone").trim().notEmpty().withMessage("Phone number is required"),

  body("address").trim().notEmpty().withMessage("Address is required"),

  body("city").trim().notEmpty().withMessage("City is required"),

  body("zip").trim().notEmpty().withMessage("ZIP code is required"),

  body("state").trim().notEmpty().withMessage("State is required"),

  body("country").trim().notEmpty().withMessage("Country is required"),

  body("userId").trim().notEmpty().withMessage("User ID is required"),

  body("isPrimary").isBoolean().withMessage("isPrimary must be a boolean"),
];

exports.getUserAddressesValidation = [
  header("userid")
    .exists()
    .withMessage("userid header is required")
    .isMongoId()
    .withMessage("Invalid userid format"),
];

exports.editAddressValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Invalid phone number"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid"),
  body("address").trim().notEmpty().withMessage("Address is required"),

  body("city").trim().notEmpty().withMessage("City is required"),

  body("zip")
    .notEmpty()
    .withMessage("ZIP code is required")
    .isPostalCode("IN")
    .withMessage("Invalid Indian ZIP code"),

  body("state").trim().notEmpty().withMessage("State is required"),

  body("country").trim().notEmpty().withMessage("Country is required"),

  body("isPrimary").isBoolean().withMessage("isPrimary must be a boolean"),

  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID"),

  body("addressId").optional().isMongoId().withMessage("Invalid Address ID"),
];

exports.deleteAddressValidation = [
  header("addressId")
    .notEmpty()
    .withMessage("Address ID is required")
    .isMongoId()
    .withMessage("Address ID must be a valid MongoDB ObjectId"),

  header("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("User ID must be a valid MongoDB ObjectId"),
];
