const router = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const {
  createBadge,
  getAllBadges,
  getBadgeDetails,
  updateBadge,
  deleteBadge,
} = require("../controllers/badgeController");
const authMiddleware = require("../middleware/authentication");

// Multer config for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/badges/";

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.get("/getAllBadges", authMiddleware, getAllBadges);
router.get("/getBadgeDetails/:id", authMiddleware, getBadgeDetails);

// to create the badge by admin
router.post("/createBadge", authMiddleware, upload.single("icon"), createBadge);

// to update the badge details
router.put(
  "/updateBadge/:badgeId",
  authMiddleware,
  upload.single("icon"),
  updateBadge
);

// to delete the badge
router.delete("/deleteBadge/:badgeId", authMiddleware, deleteBadge);

module.exports = router;
