const router = require("express").Router();
const {
  addProduct,
  getAllProducts,
  getSingleProduct,
  deleteProduct,
  updateProductStatus,
  updateProduct,
  getBestSellingProducts,
  productSearch,
  getSearchResult,
  getAllProductsForAdmin,
  getCheckoutDetailsWithOffers,
} = require("../controllers/productController");
const validationError = require("../middleware/validatorMiddleware");

const upload = require("../utils/upload");
const {
  deleteProductValidation,
  updateProductStatusValidation,
  postProductValidation,
} = require("../validators/productValidator");

const authMiddleware = require("../middleware/authentication");

router.get("/getAllProducts", authMiddleware, getAllProducts);
router.get("/getSingleProduct/:id", getSingleProduct);
router.get("/getBestSellingProducts", getBestSellingProducts);
// search route
router.get("/search", productSearch);
router.get("/getSearchResult", getSearchResult);

router.post(
  "/addProduct",
  upload.array("productImages"),
  postProductValidation,
  validationError,
  addProduct
);
router.post(
  "/updateProduct/:productId",
  authMiddleware,
  upload.array("newImages"),
  updateProduct
);

router.put(
  "/updateProductStatus/:id",
  updateProductStatusValidation,
  validationError,
  updateProductStatus
);

router.put(
  "/deleteProduct/:id",
  deleteProductValidation,
  validationError,
  deleteProduct
);
// to get all product for admin to the select list
router.get("/getAllProductsForAdmin", authMiddleware, getAllProductsForAdmin);
// to get the checkout details 
router.get("/getCheckoutDetails",authMiddleware,getCheckoutDetailsWithOffers)

module.exports = router;
