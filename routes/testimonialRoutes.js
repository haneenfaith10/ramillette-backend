const router = require("express").Router();
const authMiddleware = require("../middleware/authentication");

const {
  promoteToTestimonials,
  getTestimonialData
} = require("../controllers/testimonialController");

router.put("/promoteToTestimonials", authMiddleware, promoteToTestimonials);
// to get the testimonials 
router.get("/getTestimonialData",getTestimonialData)

module.exports = router;
