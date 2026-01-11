const { param, body } = require("express-validator");

exports.deleteProductValidation = [
  param("id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid Product ID format"),
];

exports.updateProductStatusValidation = [
  param("id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid Product ID format"),
];

exports.postProductValidation = [
  body("productName")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Product name must be at least 3 characters")
    .notEmpty()
    .withMessage("Product name is required"),

  body("productShortName")
    .isString()
    .isLength({ max: 20 })
    .withMessage("Short name can't exceed 20 characters")
    .notEmpty()
    .withMessage("Product short name is required"),

  body("productDiscount")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100")
    .notEmpty()
    .withMessage("Product discount is required"),

  body("productDescription")
    .isString()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters")
    .notEmpty()
    .withMessage("Product description is required"),

  // body("productStock")
  //   .isInt({ min: 0 })
  //   .withMessage("Stock cannot be negative")
  //   .notEmpty()
  //   .withMessage("Stock quantity is required"),

  body("productBenefits")
    .isString()
    .isLength({ min: 5 })
    .withMessage("Please describe at least one benefit")
    .notEmpty()
    .withMessage("Product benefits are required"),

  body("productCategory")
    .isString()
    .withMessage("Product category is required")
    .notEmpty(),


  body("productUseCase")
    .isString()
    .isLength({ min: 5 })
    .withMessage("Please describe a use case with minimum 5 characters")
    .notEmpty()
    .withMessage("Product use case is required"),

  body("productIngredients")
    .isString()
    .isLength({ min: 5 })
    .withMessage("Please describe ingredients with minimum 5 characters")
    .notEmpty()
    .withMessage("Product ingredients are required"),
];
