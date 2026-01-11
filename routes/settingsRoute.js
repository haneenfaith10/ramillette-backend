const router = require("express").Router();
const authMiddleware = require("../middleware/authentication");

const {
  saveSettings,
  getSettings,
  postContactFormData
} = require("../controllers/settingsController");

router.post("/save", authMiddleware, saveSettings);
router.get("/get-data", getSettings);
router.post("/postContactFormData",postContactFormData)
module.exports = router;
