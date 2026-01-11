const express = require("express");
const Country = require("../models/countryModel");
const router = express.Router();

const multer  = require("multer");
const  path =  require("path");

const {
  getallCountries,
  postCountryDetails,
  updateCountry,
  deleteCountry,
  toggleCountryStatus,
  getActiveCountries,
  setPrimary,
  getCountryBasedProducts
} = require("../controllers/countryController");
const authMiddleware = require("../middleware/authentication");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/flags"); // ensure this folder exists or create it
  },
  filename: function (req, file, cb) {
    // unique filename with timestamp + original extension
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Get all countries
router.get("/getCommunities", authMiddleware, getallCountries);

// Add a new country
router.post("/createCountry", authMiddleware, upload.single("flag"),postCountryDetails);

// Update a country
router.put("/updateCountry/:id", authMiddleware, upload.single("flag"), updateCountry);

// Delete a country
router.delete("/deleteCountry/:id", authMiddleware, deleteCountry);

// toggle country status
router.put("/toggleStatus/:id", authMiddleware, toggleCountryStatus);

// Get Active country for user
router.get("/getActiveCountries", getActiveCountries);

// to change the primary country
router.put("/setPrimary/:id", authMiddleware, setPrimary);

// to get the country related product 
router.get("/getCountryBasedProducts",getCountryBasedProducts)

module.exports = router;
