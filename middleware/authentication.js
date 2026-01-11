const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "ramillette_jwt_secret1";
const User = require("../models/userModel");
const Admin = require("../models/adminModel");

const authMiddleWare = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if it's a user or admin token
    let user = null;

    if (decoded.userId) {
      user = await User.findById(decoded.userId);
      if (!user) {
        return res
          .status(401)
          .json({ message: "User not found or unauthorized" });
      }
      req.userId = user._id; // attach user object
    } else if (decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId);
      if (!admin) {
        return res
          .status(401)
          .json({ message: "Admin not found or unauthorized" });
      }
      req.adminId = admin?._id; // attach admin object
    } else {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    next();
  } catch (err) {
    console.error("JWT error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleWare;
