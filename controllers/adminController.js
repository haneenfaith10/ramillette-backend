const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const JWT_SECRET = process.env.JWT_SECRET || "my_jwt_secret";

module.exports = {
  registerAdmin: async (req, res) => {
    try {
      const { userName, password } = req.body;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ userName });
      if (existingAdmin) {
        return res.status(404).json({ message: "Admin already exists." });
      }

      // Hash the password
      const hashPassword = await bcrypt.hash(password, 10);

      // Create new admin
      const newAdmin = new Admin({
        userName,
        password: hashPassword,
      });

      await newAdmin.save();

      console.log("Admin registered successfully");
      res.status(200).json({
        isSuccess: true,
        message: "Admin registered successfully.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  loginAdmin: async (req, res) => {
    try {
      const { username, password } = req.headers;

      const admin = await Admin.findOne({
        userName: username,
      });

      // Check if admin exists
      if (!admin) {
        return res.status(401).json({ message: "Invalid user name." });
      }
      // Check if password is correct
      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password." });
      }
      const token = jwt.sign(
        {
          adminId: admin?._id,
          userName: admin?.userName,
        },
        JWT_SECRET
      );
      console.log("Admin logged in successfully");
      res.status(200).json({
        isSuccess: true,
        message: "Admin logged in successfully.",
        token,
        admin: {
          userName: admin?.userName,
          _id: admin?._id,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  getUsers: async (req, res) => {
    try {
      const users = await User.find();

      res.status(200).json({
        isSuccess: true,
        users,
        message: "User data fetched successfully",
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to get the admin dashboard details
  dashboardOverview: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalProducts = await Product.countDocuments({ isDelete: false });

      const totalSales = await Order.aggregate([
        { $match: { isPaid: true } },
        {
          $group: {
            _id: null,
            total: { $sum: "$subTotalPrice" },
          },
        },
      ]);
      const pendingAmount = await Order.aggregate([
        { $match: { isPaid: false } },
        {
          $group: {
            _id: null,
            total: { $sum: "$subTotalPrice" },
          },
        },
      ]);

      const orderStatusCounts = await Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
      const mostOrderedUsers = await Order.aggregate([
        {
          $match: {
            status: "Delivered",
          },
        },
        {
          $group: {
            _id: "$user",
            orderCount: { $sum: 1 },
          },
        },
        {
          $sort: { orderCount: -1 },
        },
        {
          $limit: 5,
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $unwind: "$userInfo",
        },
        {
          $project: {
            _id: 0,
            userId: "$userInfo._id",
            name: "$userInfo.name",
            firstName: "$userInfo.firstName",
            lastName: "$userInfo.lastName",
            userImage: "$userInfo.userImage",
            email: "$userInfo.email",

            orderCount: 1,
          },
        },
      ]);

      const mostSoldProducts = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.productId",
            totalSold: { $sum: "$orderItems.qty" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            totalSold: 1,
            name: "$product.productName:",
            countryPrices: "$product.countryPrices",
            productImage: { $arrayElemAt: ["$product.productImages", 0] },
          },
        },
      ]);

      res.status(200).json({
        isSuccess: true,
        totalUsers,
        totalOrders,
        totalProducts,
        sales: totalSales.length > 0 ? totalSales[0]?.total : 0,
        pendingAmount: pendingAmount.length > 0 ? pendingAmount[0].total : 0,
        orderStatusCounts,
        mostOrderedUsers,
        mostSoldProducts,
      });
    } catch (err) {
      console.error("Error while getting admin dashboard data!:", err);
      res.status(500).json({ message: err.message });
    }
  },
  // function to fetch the sales chart details
  getSalesChart: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const match = {
        isPaid: true,
      };

      if (startDate && endDate) {
        match.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      const data = await Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalSales: { $sum: "$subTotalPrice" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched sales data for admin dashboard",
        data,
      });
    } catch (error) {
      console.error(
        "Error while getting sales data for admin dashboard:",
        error
      );
      res.status(500).json({ message: err.message });
    }
  },
  // function to fetch the user details for admin
  getSingleUser: async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) return res.status(400).json({ message: "User ID required" });

      const user = await User.findById(userId).select("-password");

      if (!user) return res.status(404).json({ message: "User not found" });

      const orders = await Order.find({ user: userId })
        .populate("orderItems.productId")
        .sort({ createdAt: -1 });

      res.status(200).json({
        isSuccess: true,
        user,
        orders,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res
        .status(500)
        .json({ isSuccess: false, message: "Server error." });
    }
  },
  // function to get the product details for the admin
  getSingleProductDetails: async (req, res) => {
    try {
      const { productId } = req.params;
      if (!productId) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Product ID is required." });
      }

      const product = await Product.findById(productId).populate(
        "productCategory"
      );
      if (!product) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Product not found." });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched the product details",
        product,
      });
    } catch (error) {
      console.error("Error while fetching product details for admin:", error);
      return res
        .status(500)
        .json({ isSuccess: false, message: "Server error." });
    }
  },
  // function to get the sales dashboard data
  getSalesData: async (req, res) => {
    try {
      const { startDate, endDate, interval = "monthly" } = req.query;

      const start = startDate
        ? new Date(startDate)
        : new Date(new Date().setDate(new Date().getDate() - 30));
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999); // Include entire day

      // Common match filter
      const matchFilter = {
        isPaid: true,
        createdAt: { $gte: start, $lte: end },
      };

      // 1. Summary
      const totalOrders = await Order.countDocuments({});
      const totalSalesAgg = await Order.aggregate([
        { $match: { isPaid: true } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
      ]);
      const totalSales = totalSalesAgg[0]?.totalRevenue || 0;

      const totalProducts = await Product.countDocuments({});

      // 2. Chart Data - Dynamic Grouping
      let dateFormat;
      switch (interval) {
        case "daily":
          dateFormat = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          };
          break;
        case "weekly":
          dateFormat = {
            $dateToString: {
              format: "%G-W%V", // ISO week format (e.g. "2025-W23")
              date: "$createdAt",
            },
          };
          break;
        case "3month":
        case "monthly":
        default:
          dateFormat = {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          };
          break;
      }

      console.log(dateFormat, "dateFormat");

      const chartData = await Order.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: dateFormat,
            sales: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            date: "$_id",
            sales: 1,
            orders: 1,
          },
        },
      ]);

      // 3. Top Selling Products
      const topSelling = await Order.aggregate([
        { $match: matchFilter },
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.productId",
            totalQty: { $sum: "$orderItems.qty" },
          },
        },
        { $sort: { totalQty: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 0,
            productId: "$product._id",
            productName: "$product.productName",
            totalQty: 1,
            productImage: { $arrayElemAt: ["$product.productImages", 0] },
          },
        },
      ]);

      res.status(200).json({
        isSuccess: true,
        data: {
          totalOrders,
          totalSales,
          totalProducts,
          chartData,
          topSelling,
        },
      });
    } catch (error) {
      console.error("Error in getSalesData:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to filter the order cancelled user
  filterOrderCancelledUser: async (req, res) => {
    try {
      const { fromStatus, toStatus } = req.query;

      if (!fromStatus || !toStatus) {
        return res.status(400).json({
          isSuccess: false,
          message: "fromStatus and toStatus are required",
        });
      }
      const filteredOrders = await Order.find({
        $and: [{ status: toStatus }, { "deliverySteps.status": fromStatus }],
      }).populate("user");

      // Extract unique users
      const uniqueUsers = [];
      const userMap = new Map();

      filteredOrders.forEach((order) => {
        const user = order.user;
        if (user && !userMap.has(user._id.toString())) {
          userMap.set(user._id.toString(), true);
          uniqueUsers.push(user);
        }
      });

      return res.status(200).json({
        isSuccess: true,
        users: uniqueUsers,
        count: uniqueUsers.length,
      });
    } catch (error) {
      console.error("Error while filtering order cancelled user:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
};
