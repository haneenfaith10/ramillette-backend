const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createBestSeller,
  getAllBestSeller,
  deleteBestSeller,
  getBestSellerById,
  updateBestSeller,
   getBestSellerForUser
} = require("../controllers/bestSellerController");
const authMiddleware = require("../middleware/authentication");

// Multer setup for video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/bestSellerVideos");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `video-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"));
    }
  },
});

// to get all the best seller data for admin
router.get("/getAllBestSeller", authMiddleware, getAllBestSeller);
// get single best seller
router.get("/getBestSellerById/:id", authMiddleware, getBestSellerById);

// get best seller data for user
router.get("/getBestSellerForUser", getBestSellerForUser)

router.post(
  "/postBestSeller",
  authMiddleware,
  upload.single("video"),
  createBestSeller
);
// update best seller section
router.post(
  "/updateBestSeller/:id",
  authMiddleware,
  upload.single("video"),
  updateBestSeller
);

router.delete(
  "/deleteBestSeller/:bestSellerId",
  authMiddleware,
  deleteBestSeller
);
module.exports = router;
