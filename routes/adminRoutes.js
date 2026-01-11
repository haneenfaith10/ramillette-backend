const router = require("express").Router();
const {
  adminLoginValidator,
  adminRegisterValidator,
} = require("../validators/adminValidator");
const validationError = require("../middleware/validatorMiddleware");
const {
  loginAdmin,
  registerAdmin,
  getUsers,
  dashboardOverview,
  getSalesChart,
  getSingleUser,
  getSingleProductDetails,
  getSalesData,
  filterOrderCancelledUser
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authentication");

router.get("/login", adminLoginValidator, validationError, loginAdmin);
router.get("/getUsers", getUsers);
router.get("/dashboardOverview", authMiddleware, dashboardOverview);
router.get("/getSalesChart", authMiddleware, getSalesChart);
router.get("/getSingleUser/:userId",authMiddleware,getSingleUser);
router.get("/getSingleProductDetails/:productId",authMiddleware,getSingleProductDetails)
router.get("/getSalesData",authMiddleware,getSalesData)

// filter user per cancelled order
router.get("/filterOrderCancelledUser",authMiddleware,filterOrderCancelledUser)

router.post(
  "/register",
  adminRegisterValidator,
  validationError,
  registerAdmin
);

module.exports = router;
