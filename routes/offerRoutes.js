const router = require("express").Router();
const {
  createOffer,
  deleteOffer,
  fetchCommonOffer,
  editOffer,
  createDiscountOffer,
  createCategoryOffer,
  createCouponOffer,
  createNewCustomerOffer,
  createBoGoOffer,
  getDiscountOffers,
  deleteDiscountOffer,
  toggleChangeDiscountOffer,
  editDiscountOffer,
  getAllBogoOffers,
  deleteBogoOffer,
  toggleBogoOffer,
  updateBogoOffer,
  getCategoryOffers,
  toggleCategoryOffer,
  updateCategoryOffer,
  deleteCategoryOffer,
  getCouponOffers,
  toggleCouponOffer,
  updateCouponOffer,
  deleteCouponOffer,
  getAllNewCustomerOffers,
  toggleNewCustomerOffer,
  updateNewCustomerOffer,
  deleteNewCustomerOffer,
  getCheckoutProductOffers,
  verifyCouponCode,
} = require("../controllers/offersController");
const authMiddleware = require("../middleware/authentication");

// to create the offers
router.post("/createOffer", authMiddleware, createOffer);
// to fetch the common offers
router.get("/fetchCommonOffer", authMiddleware, fetchCommonOffer);
// to edit the offer
router.put("/editOffer/:offerId", authMiddleware, editOffer);
// to delete the offer
router.delete("/deleteOffer/:offerId", authMiddleware, deleteOffer);

// to create the discount offer
router.post("/createDiscountOffer", authMiddleware, createDiscountOffer);

// to create the category offer
router.post("/createCategoryOffer", authMiddleware, createCategoryOffer);

// to create the coupon offers
router.post("/createCouponOffer", authMiddleware, createCouponOffer);

// to create the new customer offer
router.post("/createNewCustomerOffer", authMiddleware, createNewCustomerOffer);

// to create bogo offer
router.post("/createBoGoOffer", authMiddleware, createBoGoOffer);

// to get the discount offers
router.get("/getDiscountOffers", authMiddleware, getDiscountOffers);
// to delete the discount offer
router.delete(
  "/deleteDiscountOffer/:offerId",
  authMiddleware,
  deleteDiscountOffer
);
// to toggle the status
router.put(
  "/toggleChangeDiscountOffer/:offerId",
  authMiddleware,
  toggleChangeDiscountOffer
);
// to edit the discount offer data
router.put("/editDiscountOffer/:offerId", authMiddleware, editDiscountOffer);
// to get all bogo offers
router.get("/getAllBogoOffers", authMiddleware, getAllBogoOffers);
// to delete the bogo offer
router.delete("/deleteBogoOffer/:offerId", authMiddleware, deleteBogoOffer);
// to toggle the bogo offer status
router.put("/toggleBogoOffer/:offerId", authMiddleware, toggleBogoOffer);
// to edit the bogo offer data
router.put("/updateBogoOffer/:offerId", authMiddleware, updateBogoOffer);
// to get the category offer list
router.get("/getCategoryOffers", authMiddleware, getCategoryOffers);
// to toggle status of category offer
router.put(
  "/toggleCategoryOffer/:offerId",
  authMiddleware,
  toggleCategoryOffer
);
// to update the  category offer
router.put(
  "/updateCategoryOffer/:offerId",
  authMiddleware,
  updateCategoryOffer
);
// to delete the category offer
router.delete(
  "/deleteCategoryOffer/:offerId",
  authMiddleware,
  deleteCategoryOffer
);
// to get the coupon offers
router.get("/getCouponOffers", authMiddleware, getCouponOffers);
// to toggle the coupon offer
router.put("/toggleCouponOffer/:offerId", authMiddleware, toggleCouponOffer);
// to update the category offer
router.put("/updateCouponOffer/:offerId", authMiddleware, updateCouponOffer);
// to delete the coupon offer
router.delete("/deleteCouponOffer/:offerId", authMiddleware, deleteCouponOffer);
// to get the new customer offer
router.get("/getAllNewCustomerOffers", authMiddleware, getAllNewCustomerOffers);
// to toggle the new customer offer
router.put(
  "/toggleNewCustomerOffer/:offerId",
  authMiddleware,
  toggleNewCustomerOffer
);
// to update the new customer offer
router.put(
  "/updateNewCustomerOffer/:offerId",
  authMiddleware,
  updateNewCustomerOffer
);
// to delete the new customer offer
router.delete(
  "/deleteNewCustomerOffer/:offerId",
  authMiddleware,
  deleteNewCustomerOffer
);
// to get the product offers for the checkout page
router.post(
  "/getCheckoutProductOffers",
  authMiddleware,
  getCheckoutProductOffers
);
router.post("/verify-coupon", authMiddleware, verifyCouponCode);
module.exports = router;
