const router = require("express").Router();
const {
  postRating,
  getProductReviews,
  getAllReviews,
  getAllReviewsForAdmin,
  updateReviewStatus
} = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authentication");

router.get("/getProductReviews/:productId", getProductReviews);
router.get("/getAllReviews", getAllReviews);
router.get("/getAllReviewsForAdmin", authMiddleware, getAllReviewsForAdmin);

router.post("/postReview/:productId", authMiddleware, postRating);

router.put("/updateReviewStatus/:reviewId", authMiddleware, updateReviewStatus);

module.exports = router;
