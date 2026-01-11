const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel");
const JWT_SECRET = process.env.JWT_SECRET || "my_jwt_secret";
const Country = require("../models/countryModel");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Order = require("../models/orderModel");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const saltRounds = 10;
const otpStore = {};

module.exports = {
  registerUser: async (req, res) => {
    try {
      const { firstName, lastName, email, password, otp } = req.body;
      const record = otpStore[email];
      if (!record)
        return res
          .status(400)
          .json({ isSuccess: false, message: "OTP not found" });

      const isExpired = Date.now() > record.expiresAt;
      const isValid = record.otp === otp;

      if (isExpired) {
        delete otpStore[email];
        return res
          .status(400)
          .json({ isSuccess: false, message: "OTP expired" });
      }

      if (!isValid)
        return res
          .status(400)
          .json({ isSuccess: false, message: "Invalid OTP" });

      // OTP is valid
      delete otpStore[email];

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "User already exists." });
      }

      // Hash the password
      const hashPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashPassword,
      });

      await newUser.save();

      console.log("User registered");
      res
        .status(200)
        .json({ isSuccess: true, message: "User registered successfully." });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.headers;
      // Check if user exists
      const user = await User.findOne({ email }).populate({
        path: "cart.items.productId",
      });
      if (!user) {
        return res
          .status(401)
          .json({ isSuccess: false, message: "Invalid email." });
      }
      if (user.isBlocked) {
        return res.status(401).json({
          isSuccess: false,
          message:
            "Your Account has been blocked, Please contact the Customer Support!",
        });
      }
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ isSuccess: false, message: "Invalid  password." });
      }
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET
      );
      const orderCount = await Order.countDocuments({ user: user?._id });
      console.log("User logged in successfully");

      // Success
      res.status(200).json({
        isSuccess: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userImage: user.userImage || "",
        },
        wishlist: user.wishlist,
        cart: user.cart,
        orderCount,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  getUserBulkProduct: async (req, res) => {
    try {
      const { countryCode } = req.query;
      if (!countryCode) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Country code is required" });
      }

      const country = await Country.findOne({ _id: countryCode });

      if (!country) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Country not found" });
      }
      const products = await Product.find({
        isDelete: false,
        status: true,
        countries: country._id,
      })
        .populate("productCategory")
        .sort({
          createdAt: -1,
        })
        .lean();

      const filteredProducts = products.map((product) => {
        const { countryVariants, ...rest } = product;

        const variantsForCountry = countryVariants?.[countryCode];

        return {
          ...rest,
          countryVariants: {
            [countryCode]: variantsForCountry || [],
          },
        };
      });

      const allVariantPrices = filteredProducts
        .flatMap((product) =>
          (product.countryVariants[countryCode] || []).map(
            (variant) =>
              Number(variant.price) -
              (Number(variant.price) * Number(product.productDiscount || 0)) /
                100
          )
        )
        .filter((price) => !isNaN(price));

      const minPrice =
        allVariantPrices.length > 0 ? Math.min(...allVariantPrices) : 0;
      const maxPrice =
        allVariantPrices.length > 0 ? Math.max(...allVariantPrices) : 0;

      res.status(200).json({
        isSuccess: true,
        message: "Products fetched successfully",
        products: filteredProducts,
        priceRange: {
          min: minPrice,
          max: maxPrice,
        },
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // getLatestProduct: async (req, res) => {
  //   try {
  //     const { limit } = req.headers;
  //     const { countryCode } = req.query;

  //     if (isNaN(limit)) {
  //       return res.status(400).json({ message: "Invalid limit value" });
  //     }

  //     const limitNumber = parseInt(limit, 10);
  //     const country = await Country.findOne({ _id: countryCode });

  //     if (!country) {
  //       return res
  //         .status(404)
  //         .json({ isSuccess: false, message: "Country not found" });
  //     }

  //     const products = await Product.find({
  //       isDelete: false,
  //       status: true,
  //       countries: country._id,
  //     })
  //       .sort({ createdAt: -1 })
  //       .limit(limitNumber)
  //       .lean();

  //     const filteredProducts = products.map((product) => {
  //       const { countryVariants, ...rest } = product;

  //       const variantsForCountry = countryVariants?.[countryCode];

  //       return {
  //         ...rest,
  //         countryVariants: {
  //           [countryCode]: variantsForCountry || [],
  //         },
  //       };
  //     });

  //     res.status(200).json({
  //       isSuccess: true,
  //       message: "Latest Products fetched successfully",
  //       products: filteredProducts,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching product:", error);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // },
  getLatestProduct: async (req, res) => {
    try {
      const { limit } = req.headers;
      const { countryCode } = req.query;

      if (isNaN(limit)) {
        return res.status(400).json({ message: "Invalid limit value" });
      }

      const limitNumber = parseInt(limit, 10);

      const country = await Country.findOne({ _id: countryCode });

      if (!country) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Country not found" });
      }

      // ✅ Populate specialOffers
      const products = await Product.find({
        isDelete: false,
        status: true,
        countries: country._id,
      })
        .sort({ createdAt: -1 })
        .limit(limitNumber)
        .populate("specialOffers") // <-- Populate the offers
        .lean();

      const now = new Date();

      const filteredProducts = products.map((product) => {
        const { countryVariants, specialOffers, ...rest } = product;

        // ✅ Filter valid offers
        const validOffers = (specialOffers || []).filter((offer) => {
          const validFrom = offer.validFrom ? new Date(offer.validFrom) : null;
          const validTo = offer.validTo ? new Date(offer.validTo) : null;

          return (
            offer.isActive &&
            (!validFrom || now >= validFrom) &&
            (!validTo || now <= validTo)
          );
        });

        const variantsForCountry = countryVariants?.[countryCode];

        return {
          ...rest,
          specialOffers: validOffers, // ✅ Return only valid offers
          countryVariants: {
            [countryCode]: variantsForCountry || [],
          },
        };
      });

      res.status(200).json({
        isSuccess: true,
        message: "Latest Products fetched successfully",
        products: filteredProducts,
      });
    } catch (error) {
      console.error("Error fetching latest products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  addToCart: async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = req.userId;
      const countryId = req.query.countryId;

      if (!countryId) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Country ID is required" });
      }

      const productData = await Product.findById(productId);

      if (!productData) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Product not found" });
      }

      const isAvailableInCountry = productData.countries.some(
        (id) => id.toString() === countryId.toString()
      );

      if (!isAvailableInCountry) {
        return res.status(400).json({
          isSuccess: false,
          message: "Product not available in the selected country",
        });
      }

      const countryVariants = productData.countryVariants?.get(
        countryId.toString()
      );

      if (!countryVariants || countryVariants.length === 0) {
        return res.status(400).json({
          isSuccess: false,
          message: "Product has no variants available for the selected country",
        });
      }

      const selectedVariant = countryVariants[0];
      const basePrice = selectedVariant.price;

      if (!basePrice) {
        return res.status(400).json({
          isSuccess: false,
          message: "Variant price missing for the selected country",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "User not found" });
      }

      const cart = user.cart;
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId.toString()
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].qty += quantity;
        cart.items[itemIndex].price = basePrice;
      } else {
        cart.items.push({
          productId: productId,
          qty: quantity,
          price: basePrice,
        });
      }

      cart.totalPrice = parseFloat(
        cart.items
          .reduce((acc, item) => acc + item.price * item.qty, 0)
          .toFixed(2)
      );

      await user.save();

      await user.populate({
        path: "cart.items.productId",
        populate: {
          path: "productCategory",
        },
      });

      user.cart.items = user.cart.items.filter((item) => {
        const product = item.productId;

        const hasVariantForCountry =
          product.countryVariants?.get(countryId.toString())?.length > 0;

        const isAvailableInCountry = product.countries.some(
          (c) => c.toString() === countryId.toString()
        );

        return (
          hasVariantForCountry &&
          isAvailableInCountry &&
          product.status &&
          !product.isDelete
        );
      });

      user.cart.items.sort((a, b) => new Date(b.date) - new Date(a.date));

      res.status(200).json({
        isSuccess: true,
        message: "Product added to cart",
        cart: {
          totalPrice: cart.totalPrice,
          items: user.cart.items,
        },
      });
    } catch (error) {
      console.error("Error while adding product to cart:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // function to remove item from cart
  removeCartItem: async (req, res) => {
    try {
      const userId = req.userId;
      const { productId } = req.body;
      const countryId = req.query.countryId;

      if (!countryId) {
        return res.status(400).json({ message: "Country ID is required" });
      }

      const user = await User.findById(userId).populate({
        path: "cart.items.productId",
        populate: { path: "productCategory" }, // optional
      });

      if (!user || !user.cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      user.cart.items = user.cart.items.filter(
        (item) => item.productId?._id.toString() !== productId
      );

      // ✅ Recalculate prices from variant data
      const updatedItems = user.cart.items.map((item) => {
        const product = item.productId;

        const countryVariants = product.countryVariants?.get(
          countryId.toString()
        );
        const selectedVariant = countryVariants && countryVariants[0];

        const price = selectedVariant?.price || item.price || 0;

        return {
          ...item.toObject(),
          price,
          productId: product,
        };
      });

      const totalPrice = updatedItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
      );

      user.cart.items = updatedItems;
      user.cart.totalPrice = +totalPrice.toFixed(2);

      await user.save();

      user.cart.items = user.cart.items.filter((item) => {
        const product = item.productId;

        const hasVariantForCountry =
          product.countryVariants?.get(countryId.toString())?.length > 0;

        const isAvailableInCountry = product.countries.some(
          (c) => c.toString() === countryId.toString()
        );

        return (
          hasVariantForCountry &&
          isAvailableInCountry &&
          product.status &&
          !product.isDelete
        );
      });

      res.status(200).json({
        isSuccess: true,
        message: "Product removed from cart",
        cart: user.cart,
      });
    } catch (error) {
      console.error("Error while removing product from cart:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateQuantity: async (req, res) => {
    try {
      const userId = req.userId;
      const { productId, action, selectedVariants } = req.body;
      const countryId = req.query.countryId;

      if (!countryId) {
        return res.status(400).json({ message: "Country ID is required" });
      }

      if (!["increment", "decrement"].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      const user = await User.findById(userId);

      if (!user || !user.cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const item = user.cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (!item) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (action === "increment") {
        if (Object.keys(selectedVariants).length > 0) {
          const selectedVariant = selectedVariants?.[productId];

          if (!selectedVariant) {
            return res.status(400).json({
              isSuccess: false,
              message: "Selected variant info missing.",
            });
          }
          if (item.qty + 1 > selectedVariant.stock) {
            return res.status(400).json({
              isSuccess: false,
              message: "Cannot add more than available variant stock.",
            });
          }
        }

        item.qty += 1;
      } else if (action === "decrement") {
        if (item.qty > 1) {
          item.qty -= 1;
        } else {
          user.cart.items = user.cart.items.filter(
            (i) => i.productId.toString() !== productId
          );
        }
      }

      const variantList = product.countryVariants?.get(countryId.toString());
      const selectedVariant = variantList && variantList[0];
      const price = selectedVariant?.price || item.price || 0;

      item.price = price;

      user.cart.totalPrice = parseFloat(
        user.cart.items.reduce((acc, i) => acc + i.price * i.qty, 0).toFixed(2)
      );

      // user.cart.items.sort((a, b) => {
      //   const dateA = new Date(a.date || 0);
      //   const dateB = new Date(b.date || 0);
      //   return dateB - dateA;
      // });

      await user.save();

      await user.populate({
        path: "cart.items.productId",
        populate: {
          path: "productCategory",
        },
      });

      user.cart.items = user.cart.items.filter((item) => {
        const product = item.productId;

        const hasVariantForCountry =
          product.countryVariants?.get(countryId.toString())?.length > 0;

        const isAvailableInCountry = product.countries.some(
          (c) => c.toString() === countryId.toString()
        );

        return (
          hasVariantForCountry &&
          isAvailableInCountry &&
          product.status &&
          !product.isDelete
        );
      });

      res.status(200).json({
        isSuccess: true,
        message: "Product quantity updated in cart",
        cart: user.cart,
      });
    } catch (error) {
      console.error("Error while updating cart product quantity:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to get user details for profile page
  getUserDetails: async (req, res) => {
    try {
      const { userid } = req.headers;
      const user = await User.findById(userid).select("-password");
      if (!user) {
        return res.status(404).json({
          isSuccess: false,
          message: "User details not found !!",
        });
      }
      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched user details",
        user,
      });
    } catch (error) {
      console.error("Error while getting user details!", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to change the user details
  updateUserProfile: async (req, res) => {
    try {
      const userid = req.headers.userid;

      const user = await User.findById(userid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { firstName, lastName, email, phone, password } = req.body;
      const updateFields = {};

      if (firstName) updateFields.firstName = firstName;
      if (lastName) updateFields.lastName = lastName;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      if (password) updateFields.password = await bcrypt.hash(password, 10);
      if (req.file) updateFields.userImage = req.file.path;

      const updatedUser = await User.findByIdAndUpdate(
        userid,
        { $set: updateFields },
        { new: true }
      ).select("-password");

      res.status(200).json({
        isSuccess: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error while updating user details!", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  addAddress: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        phone,
        address,
        city,
        zip,
        state,
        country,
        isPrimary,
        userId,
        email,
      } = req.body;

      const user = await User.findById(userId);

      if (!user)
        return res
          .status(404)
          .json({ isSuccess: false, message: "User not found!!" });

      // If isPrimary is true, set all other addresses to not primary
      if (isPrimary) {
        user.address.forEach((addr) => {
          addr.isPrimary = false;
        });
      }
      // Add new address
      const newAddress = {
        firstName,
        lastName,
        email,
        phone,
        streetAddress: address,
        city,
        zip,
        state,
        country,
        isPrimary: isPrimary || false,
      };

      user.address.push(newAddress);
      await user.save();

      // Sort addresses by createdAt descending (latest first)
      const sortedAddresses = user.address.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      res.status(200).json({
        isSuccess: true,
        message: "Address added successfully",
        address: sortedAddresses,
      });
    } catch (error) {
      console.error("Error while adding address!", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getAddresses: async (req, res) => {
    try {
      const { userid } = req.headers;

      const user = await User.findById(userid);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Sort addresses by createdAt descending (most recent first)
      const sortedAddresses = user.address.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      res.status(200).json({
        isSuccess: true,
        message: "User addresses fetched successfully",
        addresses: sortedAddresses,
      });
    } catch (error) {
      console.error("Error while getting user address!", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to edit user addresses
  editAddress: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        zip,
        state,
        country,
        isPrimary,
        userId,
        addressId,
      } = req.body;

      const update = {
        "address.$.firstName": firstName,
        "address.$.lastName": lastName,
        "address.$.email": email,
        "address.$.phone": phone,
        "address.$.streetAddress": address,
        "address.$.city": city,
        "address.$.zip": zip,
        "address.$.state": state,
        "address.$.country": country,
        "address.$.isPrimary": isPrimary,
      };

      const user = await User.findOneAndUpdate(
        {
          _id: userId,
          "address._id": addressId,
        },
        { $set: update },
        { new: true }
      );

      if (!user) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Address not found" });
      }

      // Sort addresses by createdAt descending (most recent first)
      const sortedAddresses = user.address.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      res.status(200).json({
        isSuccess: true,
        message: "Address updated successfully",
        addresses: sortedAddresses,
      });
    } catch (error) {
      console.error("Error while editing user address!", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to edit the user address
  deleteAddress: async (req, res) => {
    try {
      const { userid, addressid } = req.headers;

      const user = await User.findById(userid);

      if (!user) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "User not found" });
      }

      // Filter out the address with the matching _id
      user.address = user.address.filter(
        (addr) => addr._id.toString() !== addressid
      );

      await user.save();

      const sortedAddresses = user.address.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      res.status(200).json({
        isSuccess: true,
        message: "Address deleted successfully",
        addresses: sortedAddresses,
      });
    } catch (error) {
      console.error("Error while deleting user address!", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to add the product with quantity
  addToCartWithQuantity: async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = req.userId;
      const countryId = req.query.countryId;

      if (!countryId) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Country ID is required" });
      }

      const productData = await Product.findById(productId);

      if (!productData) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Product not found" });
      }

      const isAvailableInCountry = productData.countries.some(
        (id) => id.toString() === countryId.toString()
      );

      if (!isAvailableInCountry) {
        return res.status(400).json({
          isSuccess: false,
          message: "Product not available in the selected country",
        });
      }

      const countryVariants = productData.countryVariants?.get?.(
        countryId.toString()
      );

      if (!countryVariants || countryVariants.length === 0) {
        return res.status(400).json({
          isSuccess: false,
          message: "No variants available for the selected country",
        });
      }

      const selectedVariant = countryVariants[0];
      const basePrice = selectedVariant.price;

      if (!basePrice) {
        return res.status(400).json({
          isSuccess: false,
          message: "Variant price not found for the selected country",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "User not found" });
      }

      const cart = user.cart;
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId.toString()
      );

      if (itemIndex > -1) {
        // Update existing cart item
        cart.items[itemIndex].qty = quantity;
        cart.items[itemIndex].price = basePrice;
      } else {
        // Add new cart item
        cart.items.push({
          productId: productId,
          qty: quantity,
          price: basePrice,
          date: new Date(),
        });
      }

      cart.totalPrice = parseFloat(
        cart.items
          .reduce((acc, item) => acc + item.price * item.qty, 0)
          .toFixed(2)
      );

      await user.save();

      await user.populate({
        path: "cart.items.productId",
        populate: {
          path: "productCategory countries",
        },
      });

      // Filter cart based on selected country and availability
      user.cart.items = user.cart.items.filter((item) => {
        const product = item.productId;

        const hasVariantForCountry =
          product.countryVariants?.get?.(countryId.toString())?.length > 0;

        const isAvailableInCountry = product.countries.some(
          (c) => c._id.toString() === countryId.toString()
        );

        return (
          hasVariantForCountry &&
          isAvailableInCountry &&
          product.status &&
          !product.isDelete
        );
      });

      // user.cart.items.sort((a, b) => new Date(b.date) - new Date(a.date));

      return res.status(200).json({
        isSuccess: true,
        message: "Product added to cart",
        cart: {
          totalPrice: cart.totalPrice,
          items: user.cart.items,
        },
      });
    } catch (error) {
      console.error("Error while adding product with quantity:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to change the quantity of the cart item in the checkout pages
  changeCartQuantity: async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const { countryId } = req.query;
      const userId = req.userId;

      if (!productId || !quantity || !countryId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Missing required fields: productId, quantity, or countryId",
        });
      }
      const product = await Product.findById(productId).lean();

      if (!product) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Product not found" });
      }

      // Check if product is available in the selected country
      const isAvailableInCountry = product.countries.some(
        (c) => c.toString() === countryId.toString()
      );
      if (!isAvailableInCountry) {
        return res.status(400).json({
          isSuccess: false,
          message: "Product is not available in the selected country",
        });
      }
      if (product.productStock < quantity) {
        return res.status(200).json({
          isSuccess: false,
          message: "Product is out of stock",
        });
      }
      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "User not found" });
      }

      // Find product in cart and update quantity
      const itemIndex = user.cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex === -1) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Product not in cart" });
      }

      user.cart.items[itemIndex].qty = quantity;
      await user.save();
      await user.populate({
        path: "cart.items.productId",
        populate: {
          path: "countryPrices.country",
        },
      });
      // filter the cart based on the user selected country
      user.cart.items = user.cart.items.filter((item) => {
        const product = item.productId;

        // 1. Check price exists for country
        const hasPriceForCountry = product.countryPrices.some(
          (cp) => cp.country._id.toString() === countryId
        );

        // 2. Check availability in country
        const isAvailableInCountry = product.countries.some(
          (c) => c._id.toString() === countryId
        );

        return (
          hasPriceForCountry &&
          isAvailableInCountry &&
          product.status &&
          !product.isDelete
        );
      });
      return res.status(200).json({
        isSuccess: true,
        message: "Cart updated successfully",
        cart: user.cart,
      });
    } catch (error) {
      console.error("Error while changing cart product with quantity!", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to get the otp for user
  getOtp: async (req, res) => {
    try {
      const { email } = req.body;

      const userData = await User.findOne({ email });
      if (userData) {
        return res.status(404).json({
          isSuccess: false,
          message: "The email is already registered, Please try to login",
        });
      }
      const otp = generateOTP();
      const expiresAt = Date.now() + 5 * 60 * 1000;
      otpStore[email] = { otp, expiresAt };
      await transporter.sendMail({
        from: `"Ramillette" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your One-Time Password (OTP) - Action Required",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #edc862;">Welcome to Ramillette!</h2>
          <p>Hi there,</p>
          <p>To proceed with your registration, please use the following One-Time Password (OTP):</p>
          <div style="font-size: 24px; font-weight: bold; color: #000; background-color: #f1f1f1; padding: 10px; display: inline-block; margin: 10px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for the next 5 minutes. Please do not share it with anyone.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <br/>
          <p>Best regards,<br/>The Ramillette Team</p>
        </div>
  `,
      });

      res.status(200).json({
        isSuccess: true,
        message: "Otp sent successfully",
      });
    } catch (error) {
      console.error("Error while sending otp!", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to get otp for change password
  getOtpForForgetPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const userData = await User.findOne({ email });
      if (!userData) {
        return res.status(404).json({
          isSuccess: false,
          message: "This Email is not Registered , Please try to register!",
        });
      }
      const otp = generateOTP();
      const expiresAt = Date.now() + 5 * 60 * 1000;
      otpStore[email] = { otp, expiresAt };
      await transporter.sendMail({
        from: `"Ramillette" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your One-Time Password (OTP) - Action Required",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #edc862;">Welcome to Ramillette!</h2>
          <p>Hi there,</p>
          <p>To proceed with your forget password, please use the following One-Time Password (OTP):</p>
          <div style="font-size: 24px; font-weight: bold; color: #000; background-color: #f1f1f1; padding: 10px; display: inline-block; margin: 10px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for the next 5 minutes. Please do not share it with anyone.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <br/>
          <p>Best regards,<br/>The Ramillette Team</p>
        </div>
  `,
      });

      res.status(200).json({
        isSuccess: true,
        message: "Otp sent successfully",
      });
    } catch (error) {
      console.error("Error while sending otp!", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to verify the otp for password change
  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;

      const record = otpStore[email];
      if (!record)
        return res
          .status(400)
          .json({ isSuccess: false, message: "OTP not found" });

      const isExpired = Date.now() > record.expiresAt;
      const isValid = record.otp === otp;

      if (isExpired) {
        delete otpStore[email];
        return res
          .status(400)
          .json({ isSuccess: false, message: "OTP expired" });
      }

      if (!isValid)
        return res
          .status(400)
          .json({ isSuccess: false, message: "Invalid OTP" });

      // OTP is valid
      // delete otpStore[email];
      return res
        .status(200)
        .json({ isSuccess: true, message: "OTP verified successfully" });
    } catch (error) {
      console.error("Error while verifying otp!", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to change the password
  changePassword: async (req, res) => {
    try {
      const { email, newPassword } = req.body.data || {};

      if (!email || !newPassword) {
        return res.status(400).json({
          isSuccess: false,
          message: "Email and password are required",
        });
      }
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;
      await user.save();

      return res
        .status(200)
        .json({ isSuccess: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error while changing password!", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to get the product availability with stock
  isProductAvailable: async (req, res) => {
    try {
      const { productid, quantity = 1, variantid } = req.headers;
      console.log("Checking ....");
      if (!productid || !variantid) {
        return res.status(400).json({
          isSuccess: false,
          message: "Product ID and Variant ID are required.",
        });
      }

      const product = await Product.findById(productid);
      if (!product) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Product not found." });
      }

      const countryVariants = product.countryVariants;

      let matchedVariant = null;

      // Loop through all country keys to find the variant
      for (const [countryId, variants] of countryVariants.entries()) {
        matchedVariant = variants.find(
          (variant) => variant._id.toString() === variantid
        );
        if (matchedVariant) break;
      }

      if (!matchedVariant) {
        return res.status(404).json({
          isSuccess: false,
          message: "Variant not found in any country.",
        });
      }

      if (matchedVariant.stock >= quantity) {
        return res.status(200).json({
          isSuccess: true,
          isAvailable: true,
          message: "Variant is available.",
          stock: matchedVariant.stock,
        });
      } else {
        return res.status(200).json({
          isSuccess: true,
          isAvailable: false,
          message: "Insufficient stock for this variant.",
          stock: matchedVariant.stock,
        });
      }
    } catch (error) {
      console.error("Error checking product availability:", error);
      return res
        .status(500)
        .json({ isSuccess: false, message: "Internal server error." });
    }
  },
  getUserSubCart: async (req, res) => {
    try {
      const userId = req.query.userId;
      const countryId = req.query.countryId;

      if (!countryId) {
        return res.status(400).json({
          isSuccess: false,
          message: "countryId is required in query params.",
        });
      }

      // Get user's cart with populated products
      const user = await User.findById(userId).populate("cart.items.productId");
      const cart = user?.cart;

      if (!cart || cart.items.length === 0) {
        console.log("Empty cart data");
        // 1. Best selling products for the selected country
        const bestSellingProducts = await Order.aggregate([
          { $unwind: "$orderItems" },
          {
            $lookup: {
              from: "products",
              localField: "orderItems.productId",
              foreignField: "_id",
              as: "productInfo",
            },
          },
          { $unwind: "$productInfo" },
          {
            $match: {
              $and: [
                {
                  "productInfo.countries": new mongoose.Types.ObjectId(
                    countryId
                  ),
                },
                { "productInfo.status": true },
                { "productInfo.isDelete": { $ne: true } },
              ],
            },
          },
          {
            $group: {
              _id: "$orderItems.productId",
              totalSold: { $sum: "$orderItems.qty" },
              product: { $first: "$productInfo" },
            },
          },
          { $sort: { totalSold: -1 } },
          { $limit: 10 },
          {
            $project: {
              _id: "$product._id",
              productName: "$product.productName",
              productImages: "$product.productImages",
              productCategory: "$product.productCategory",
              countries: "$product.countries",
              productRating: "$product.productRating",
              totalSold: 1,
               countryVariants: "$product.countryVariants",
              productDiscount: "$product.productDiscount",
            },
          },
        ]);

        // 2. Get user purchased product categories
        const userOrders = await Order.find({ user: userId })
          .select("orderItems")
          .populate({
            path: "orderItems.productId",
            select: "productCategory",
          });

        const purchasedCategories = new Set();
        userOrders.forEach((order) => {
          order.orderItems.forEach((item) => {
            const category = item.productId?.productCategory;
            if (Array.isArray(category)) {
              category.forEach((cat) =>
                purchasedCategories.add(cat.toString())
              );
            } else if (category) {
              purchasedCategories.add(category.toString());
            }
          });
        });

        // 3. Fetch recommendation products from those categories
        const recommendedProducts = await Product.find({
          $and: [
            { productCategory: { $in: Array.from(purchasedCategories) } },
            { countries: new mongoose.Types.ObjectId(countryId) },
            { status: true },
            { isDelete: { $ne: true } },
          ],
        }).limit(10);

        const combinedProducts = [
          ...bestSellingProducts,
          ...recommendedProducts,
        ];
        const uniqueProducts = Array.from(
          new Map(
            combinedProducts.map((item) => [item._id.toString(), item])
          ).values()
        );

        console.log(uniqueProducts, "uniqueProducts");

        return res.status(200).json({
          isSuccess: true,
          type: "empty-cart",
          message:
            "Fetched best-sellers and user's preferred category products",
          data: uniqueProducts,
        });
      }

      const cartItems = cart.items.filter((item) => item?.productId);
      const categoryIds = cartItems
        .flatMap((item) => item.productId.productCategory || [])
        .map((cat) =>
          typeof cat === "object" && cat._id
            ? cat._id.toString()
            : cat.toString()
        );

      const uniqueCategories = [...new Set(categoryIds)].filter(Boolean);
      const productIdsInCart = cartItems.map((item) =>
        item.productId._id.toString()
      );

      const similarProducts = await Product.find({
        $and: [
          { productCategory: { $in: uniqueCategories } },
          { countries: new mongoose.Types.ObjectId(countryId) },
          { _id: { $nin: productIdsInCart } },
          { status: true },
          { isDelete: { $ne: true } },
        ],
      })
        .limit(10)
        .lean();

      const filteredSimilarProducts = similarProducts.map((product) => {
        const updatedProduct = { ...product };

        if (updatedProduct.countryVariants instanceof Map) {
          const variant = updatedProduct.countryVariants.get(
            countryId.toString()
          );
          updatedProduct.countryVariants = new Map();
          if (variant) {
            updatedProduct.countryVariants.set(countryId.toString(), variant);
          }
        } else if (typeof updatedProduct.countryVariants === "object") {
          const variant = updatedProduct.countryVariants[countryId.toString()];
          updatedProduct.countryVariants = {};
          if (variant) {
            updatedProduct.countryVariants[countryId.toString()] = variant;
          }
        }

        return updatedProduct;
      });

      return res.status(200).json({
        isSuccess: true,
        type: "similar-category",
        message: "Successfully fetched similar category products",
        data: filteredSimilarProducts,
      });
    } catch (error) {
      console.error("Sub cart error:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Failed to fetch user sub cart details",
      });
    }
  },
  // function to fetch the user's wishlist,orders and cart data when user change the country
  getUserCountrySpecificData: async (req, res) => {
    try {
      const userId = req.userId;
      const { countryId } = req.query;

      const user = await User.findById(userId)
        .populate({
          path: "cart.items.productId",
        })
        .populate("wishlist.products.product");

      // Filter cart products by country availability
      const filteredCartItems = user.cart.items.filter((item) =>
        item.productId.countries.some((c) => c.toString() === countryId)
      );

      const filteredWishlistItems = user.wishlist.products.filter((item) =>
        item.product.countries.some((c) => c.toString() === countryId)
      );

      // Optionally filter orders if you store them with country info
      const orders = await Order.find({ user: userId, country: countryId });

      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched user cart,wishlist and orders",
        cart: {
          items: filteredCartItems,
          totalPrice: filteredCartItems.reduce(
            (acc, item) => acc + item.qty * item.price,
            0
          ),
        },
        wishlist: {
          products: filteredWishlistItems,
        },
        orders,
      });
    } catch (error) {
      console.error("Sub cart error:", error);
      res.status(500).json({
        isSuccess: false,
        message:
          "Failed to fetch user cart,wishlist and order when changes country",
      });
    }
  },
  // function to change the status of the user
  toggleUserStatus: async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(404).json({
          isSuccess: false,
          message: "User id is missing!",
        });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          isSuccess: false,
          message: "User data not found!!",
        });
      }
      user.status = !user.status;
      user.save();
      res.status(200).json({
        isSuccess: true,
        message: "User status updated successfully!",
      });
    } catch (error) {
      console.log("Error while changing the user status", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  },
  // function to fetch the related products
  // getRelatedProduct: async (req, res) => {
  //   try {
  //     const { productId } = req.params;
  //     const product = await Product.findById(productId);
  //     if (!product) {
  //       return res.status(404).json({
  //         isSuccess: false,
  //         message: "Product not found",
  //       });
  //     }
  //     const related = await Product.find({
  //       _id: { $ne: productId },
  //       productCategory: { $in: product.productCategory },
  //       $and: [{ status: true }, { isDelete: false }],
  //     }).limit(15);

  //     res.status(200).json({
  //       isSuccess: true,
  //       relatedProducts: related,
  //       message: "Related products are fetched successfully",
  //     });
  //   } catch (error) {
  //     console.log("Error while getting the related products", error);
  //     res.status(500).json({
  //       isSuccess: false,
  //       message: "Internal Server Error",
  //     });
  //   }
  // },
  getRelatedProduct: async (req, res) => {
    try {
      const { productId } = req.params;
      const countryId = req.query.countryId;

      if (!countryId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Country code is required",
        });
      }

      // Get Country ID
      const countryData = await Country.findOne({ _id: countryId });
      if (!countryData) {
        return res.status(404).json({
          isSuccess: false,
          message: "Country not found",
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          isSuccess: false,
          message: "Product not found",
        });
      }

      const relatedProducts = await Product.find({
        _id: { $ne: productId },
        productCategory: { $in: product.productCategory },
        status: true,
        isDelete: false,
        countries: { $elemMatch: { $eq: countryData._id } }, // 🚀 Must be available for that country
      })
        .limit(15)
        .populate("productCategory")
        .populate("specialOffers");

      return res.status(200).json({
        isSuccess: true,
        relatedProducts,
        message: "Related products fetched successfully",
      });
    } catch (error) {
      console.log("Error while getting related products", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  },
  permanentlyBlockUser: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "User not found" });
      }

      // Toggle logic
      user.isBlocked = !user.isBlocked;
      user.status = false;
      await user.save();

      return res.status(200).json({
        isSuccess: true,
        message: `User has been ${
          user.isBlocked ? "blocked" : "unblocked"
        } successfully`,
        updatedUser: user,
      });
    } catch (err) {
      console.error("Error in permanentlyBlockUser:", err);
      res.status(500).json({ isSuccess: false, message: "Server error" });
    }
  },
  // function to get the user wishlist details
  getUserWishlistData: async (req, res) => {
    try {
      const { userid, countryid } = req.headers;

      if (!userid || !mongoose.Types.ObjectId.isValid(userid)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Valid user ID is required in headers",
        });
      }

      if (!countryid || !mongoose.Types.ObjectId.isValid(countryid)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Valid country ID is required in headers",
        });
      }

      const userData = await User.findById(userid)
        .populate({
          path: "wishlist.products.product",
        })
        .lean();

      if (!userData || !userData.wishlist?.products) {
        return res.status(404).json({
          isSuccess: false,
          message: "User or wishlist not found",
        });
      }

      // Filter products available in the requested country
      const filteredWishlist = userData.wishlist.products.filter((item) => {
        const product = item.product;
        return (
          product &&
          Array.isArray(product.countries) &&
          product.countries.some(
            (country) => country.toString() === countryid.toString()
          )
        );
      });

      return res.status(200).json({
        isSuccess: true,
        message: "User wishlist fetched successfully",
        wishlist: filteredWishlist,
      });
    } catch (error) {
      console.error("Error while getting the user wishlist:", error);
      return res
        .status(500)
        .json({ isSuccess: false, message: "Server error" });
    }
  },
};
