const express = require("express");
const multer = require("multer");
const {
  createVideoBanner,
  getVideoBanners,
  getVideoBannerForUser,
  deleteVideoBanner,
  getVideoBannerById,
  updateVideoBanner,
  changeVideoBannerStatus,
} = require("../controllers/videoBannerController");

const router = express.Router();

const authMiddleware = require("../middleware/authentication");

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/videos/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files are allowed"), false);
  },
});

// POST: Upload video banner
router.post(
  "/addVideoBanner",
  authMiddleware,
  upload.single("videoFile"),
  createVideoBanner
);

// GET: Fetch all video banners (optional)
router.get("/getVideoBanners", getVideoBanners);

// to get the banner for user
router.get("/getVideoBannerForUser", getVideoBannerForUser);
// to get the single banner to edit
router.get("/getVideoBannerById/:bannerId", authMiddleware, getVideoBannerById);

// update the video banner
router.put(
  "/updateVideoBanner/:bannerId",
  authMiddleware,
  upload.single("videoFile"),
  updateVideoBanner
);

// to update the banner status
router.put(
  "/changeVideoBannerStatus/:bannerId",
  authMiddleware,
  changeVideoBannerStatus
);

// function to delete the banner
router.delete(
  "/deleteVideoBanner/:bannerId",
  authMiddleware,
  deleteVideoBanner
);

module.exports = router;
