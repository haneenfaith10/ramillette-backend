const router = require("express").Router();

const {
  createProvider,
  getAllActiveProviders,
  getAllProviders,
  deleteProvider,
  updateProvider,
} = require("../controllers/shippingProviderController");
const authMiddleware = require("../middleware/authentication");

router.get("/getAllActiveProviders", authMiddleware, getAllActiveProviders);
router.get("/getAllProviders", authMiddleware, getAllProviders);

router.post("/createProvider", authMiddleware, createProvider);

router.put("/updateProvider/:id",authMiddleware,updateProvider);

router.delete("/deleteProvider",authMiddleware,deleteProvider)

module.exports = router;
