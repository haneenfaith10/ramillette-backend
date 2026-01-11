const router = require("express").Router();
const authMiddleware = require("../middleware/authentication");
const {
  updateTaxForCountry,
  getTaxByCountry,
} = require("../controllers/taxController");

// PUT update/create tax for a specific country
router.put("/updateCountryTax/:countryId", authMiddleware, updateTaxForCountry);

// to get the country tax
router.get("/getTaxByCountry/:countryId", getTaxByCountry);

module.exports = router;
