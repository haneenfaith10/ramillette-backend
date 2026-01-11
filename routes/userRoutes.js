const router = require("express").Router();
const {
  registerUser,
  loginUser,
  getUserBulkProduct,
  getLatestProduct,
  addToCart,
  removeCartItem,
  updateQuantity,
  getUserDetails,
  updateUserProfile,
  addAddress,
  getAddresses,
  editAddress,
  deleteAddress,
  addToCartWithQuantity,
  changeCartQuantity,
  getOtp,
  getOtpForForgetPassword,
  verifyOtp,
  changePassword,
  isProductAvailable,
  getUserSubCart,
  getUserCountrySpecificData,
  toggleUserStatus,
  getRelatedProduct,
  permanentlyBlockUser,
  getUserWishlistData
} = require("../controllers/userController");

const {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  getUserWishlistDetails,
} = require("../controllers/wishlistController");

const userImagesUpload = require("../utils/userImageUpload");

const authMiddleWare = require("../middleware/authentication");

// api values validation section
const {
  registerValidation,
  loginValidation,
  getUserDetailsValidation,
  addAddressValidation,
  getUserAddressesValidation,
  editAddressValidation,
  deleteAddressValidation,
} = require("../validators/userValidators");
const {
  wishlistValidator,
  getUserWishlistDetailsValidator,
} = require("../validators/wishListValidator");
const validationError = require("../middleware/validatorMiddleware");

router.get("/login", loginValidation, validationError, loginUser);
router.get("/getUserBulkProduct", getUserBulkProduct);
router.get("/getUserWishlist", getUserWishlist);
router.get("/getLatestProduct", getLatestProduct);
router.get(
  "/getUserDetails",
  getUserDetailsValidation,
  validationError,
  getUserDetails
);
router.get(
  "/getUserWishlistDetails",
  authMiddleWare,
  getUserWishlistDetailsValidator,
  validationError,
  getUserWishlistDetails
);
router.get(
  "/getAddresses",
  authMiddleWare,
  getUserAddressesValidation,
  validationError,
  getAddresses
);
// to get the product availability
router.get("/isProductAvailable", authMiddleWare, isProductAvailable);

// router to get the user subcart
router.get("/getUserSubCart", getUserSubCart);

// get user cart ,order and wishlist data  when user changes the country
router.get(
  "/getUserCountrySpecificData",
  authMiddleWare,
  getUserCountrySpecificData
);
// to get the related products
router.get("/getRelatedProduct/:productId", getRelatedProduct);
// user registration
router.post("/register", registerValidation, validationError, registerUser);
// add product to cart
router.post("/addToCart", authMiddleWare, addToCart);
// add user address
router.post(
  "/addAddress",
  authMiddleWare,
  addAddressValidation,
  validationError,
  addAddress
);
router.post("/addToCartWithQuantity", authMiddleWare, addToCartWithQuantity);

// for sending otp
router.post("/getOtp", getOtp);
router.post("/getOtpForForgetPassword", getOtpForForgetPassword);
router.post("/verifyOtp", verifyOtp);
router.post("/changePassword", changePassword);

// add product in wishlist
router.put("/addToWishlist", wishlistValidator, validationError, addToWishlist);
// remote wishlist item
router.put(
  "/removeFromWishlist",
  wishlistValidator,
  validationError,
  removeFromWishlist
);
router.put("/changeCartQuantity", authMiddleWare, changeCartQuantity);
// route to change user profile details
router.post(
  "/updateUserProfile",
  userImagesUpload.single("userImage"),
  updateUserProfile
);

// remote cart item
router.put("/removeCartItem", authMiddleWare, removeCartItem);
// update cart product quantity
router.put("/updateQuantity", authMiddleWare, updateQuantity);
router.put(
  "/editAddress",
  authMiddleWare,
  editAddressValidation,
  validationError,
  editAddress
);

// to block and unblock the user
router.put("/toggleUserStatus", authMiddleWare, toggleUserStatus);

// delete the user address
router.delete(
  "/deleteAddress",
  authMiddleWare,
  deleteAddressValidation,
  validationError,
  deleteAddress
);

router.put("/permanentlyBlockUser/:id", authMiddleWare, permanentlyBlockUser);

router.get('/getUserWishlistData',getUserWishlistData)

module.exports = router;
