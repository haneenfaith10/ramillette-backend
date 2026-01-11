const router = require("express").Router();

const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderDetails,
  cancelOrder,
  placeSingleOrder,
  updateShippingDetails,
  cancelOrderByAdmin,
  updateDeliveryStep,
  bulkOrderStatusUpdate
} = require("../controllers/orderController");
const authMiddleWare = require("../middleware/authentication");

router.post("/placeOrder", authMiddleWare, placeOrder);
router.post("/placeSingleOrder", authMiddleWare, placeSingleOrder);
router.get("/getUserOrders", authMiddleWare, getUserOrders);
router.get("/getAllOrders", authMiddleWare, getAllOrders);
router.put("/updateOrderStatus", authMiddleWare, updateOrderStatus);
router.get("/getOrderDetails/:orderId", getOrderDetails);
// to cancel order
router.put("/cancelOrder/:orderId", authMiddleWare, cancelOrder);
router.put("/cancelOrderByAdmin/:orderId", authMiddleWare, cancelOrderByAdmin);
// to update the order delivery status
router.put("/updateDeliveryStep/:orderId", authMiddleWare, updateDeliveryStep);
// to update the bulk order status
router.put("/bulkOrderStatusUpdate",authMiddleWare,bulkOrderStatusUpdate)
//to update shipping details
router.post(
  "/updateShippingDetails/:orderId",
  authMiddleWare,
  updateShippingDetails
);

module.exports = router;
