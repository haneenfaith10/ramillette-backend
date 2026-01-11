const { body } = require("express-validator");

exports.brandValidation = [
  body("brandName")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 2 })
    .withMessage("Brand name must be at least 2 characters long"),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ message: "Brand image is required" });
    }
    next();
  },
];

exports.changeBrandStatusValidation = [
  body("brandId")
    .notEmpty()
    .withMessage("Brand ID is required")
    .isMongoId()
    .withMessage("Invalid Brand ID format"),
];

exports.deleteBrandValidation = [
  body("brandId")
    .notEmpty()
    .withMessage("Brand ID is required")
    .isMongoId()
    .withMessage("Invalid Brand ID format"),
];

exports.updateBrandDetailsValidation = [
  body("brandName")
    .trim()
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 2 })
    .withMessage("Brand name must be at least 2 characters long"),
  body("brandId").isMongoId().withMessage("Invalid brand ID format"),
];
