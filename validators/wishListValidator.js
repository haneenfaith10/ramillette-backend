const { body, header } = require("express-validator");

exports.wishlistValidator = [
  body("userId")
    .notEmpty()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("userId must be a valid MongoDB ID"),

  body("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("productId must be a valid MongoDB ID"),
];

exports.getUserWishlistDetailsValidator = [
  header("userid")
    .notEmpty()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("userId must be a valid MongoDB ID"),
];
