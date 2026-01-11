const router = require("express").Router();

const uploads = require("../utils/brandUpload");

const authMiddleWare = require("../middleware/authentication");
const brandController = require("../controllers/brandController");
const {
  brandValidation,
  changeBrandStatusValidation,
  deleteBrandValidation,
  updateBrandDetailsValidation,
} = require("../validators/brandValidator");
const validationError = require("../middleware/validatorMiddleware");

// get all product brands
router.get("/getBrands", authMiddleWare, brandController.getBrands);

// create new product brand
router.post(
  "/postBrand",
  authMiddleWare,
  uploads.single("brandImage"),
  brandValidation,
  validationError,
  brandController.createBrand
);
// to edit the brand details
router.post(
  "/updateBrandDetails",
  uploads.single("brandImage"),
  authMiddleWare,
  updateBrandDetailsValidation,
  validationError,
  brandController.updateBrandDetails
);

// change the status of the brand
router.put(
  "/changeBrandStatus",
  authMiddleWare,
  changeBrandStatusValidation,
  validationError,
  brandController.changeBrandStatus
);
// soft delete brand
router.put(
  "/deleteBrand",
  authMiddleWare,
  deleteBrandValidation,
  validationError,
  brandController.deleteBrand
);

module.exports = router;
