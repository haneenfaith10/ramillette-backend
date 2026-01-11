const router = require("express").Router();
const {
  createAlert,
  getCountryAlert,
  updateCollectionAlert,
  deleteCollectionAlert,
} = require("../controllers/alertController");
const authMiddleware = require("../middleware/authentication");

// to get the all collection alert with the country
router.get("/getCountryAlert/:countryId", getCountryAlert);

// to create collection alert with country id
router.post("/createAlert", authMiddleware, createAlert);

// to update the collection alert
router.put("/updateCollectionAlert", authMiddleware, updateCollectionAlert);

// to delete the collection alert
router.delete(
  "/deleteCollectionAlert/:alertId",
  authMiddleware,
  deleteCollectionAlert
);

module.exports = router;
