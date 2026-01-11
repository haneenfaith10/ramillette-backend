const express = require("express");
const bannerUpload = require("../utils/bannerUpload.js");
const {
  createBanner,
  getAllBanners,
  getBannerForUser,
  deleteBanner,
  getBannerById,
  updateBannerDetails,
  toggleBannerStatus
} = require("../controllers/bannerController.js");
const router = express.Router();
const authMiddleware = require("../middleware/authentication.js");

//to create banners
router.post(
  "/crateBanner",
  authMiddleware,
  bannerUpload.single("image"),
  createBanner
);
// to update the banner details
router.post(
  "/updateBannerDetails/:bannerId",
  authMiddleware,
  bannerUpload.single("image"),
  updateBannerDetails
);
// to get all the banners for admin
router.get("/getAllBanners", authMiddleware, getAllBanners);
// to get the banner for user
router.get("/getBannerForUser", getBannerForUser);

// get banner by Id
router.get("/getBannerById/:bannerId", getBannerById);

// to toggle banner status
router.put("/toggleBannerStatus/:bannerId",authMiddleware,toggleBannerStatus)

// to delete the banner
router.delete("/deleteBanner/:bannerId", authMiddleware, deleteBanner);

module.exports = router;
