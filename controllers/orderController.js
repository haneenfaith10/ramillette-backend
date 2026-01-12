const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Tax = require("../models/taxModel");
const nodemailer = require("nodemailer");
const generateOrderConfirmationEmail = require("../utils/orderConfirmationMail");
const Settings = require("../models/settingsModel");
const Country = require("../models/countryModel");
const mongoose = require("mongoose");

function calculateCartSubtotal(cartItems, countryId) {
  if (!countryId) {
    console.warn("countryId is missing");
    return 0;
  }

  return cartItems.reduce((subtotal, item) => {
    const variants = item.productId.countryVariants?.[countryId] || [];

    if (!variants.length) return subtotal;

    // Use the first variant's price (or customize as needed)
    const basePrice = Number(variants[0].price || 0);
    const discountPercent = Number(item.productId.productDiscount || 0);
    const discountedPrice = basePrice - (basePrice * discountPercent) / 100;

    const itemTotal = discountedPrice * item.qty;
    return subtotal + itemTotal;
  }, 0);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"Ramillette" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error(`Error sending email to ${options.email}:`, error);
  }
};

async function sendDeliverySuccessEmail(toEmail, order) {
  if (!toEmail) return;

  const mailOptions = {
    from: `"Ramillette" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🎉 Your Order Has Been Delivered!",
    html: `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #edc862; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #edc862; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Ramillette</h1>
        <p style="margin: 5px 0 0;">Your trusted shopping partner</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Hi ${order.user?.firstName || "Customer"},</h2>
        <p style="font-size: 16px; color: #555;">
          We're excited to let you know that your order <strong>#${
            order._id
          }</strong> has been <span style="color: green; font-weight: bold;">delivered successfully</span>!
        </p>
        <p style="font-size: 16px; color: #555;">
          We hope everything arrived safely and that you enjoy your purchase. If you have any questions, feel free to reach out to us.
        </p>
      </div>
      <div style="background-color: #f9f9f9; text-align: center; padding: 15px; font-size: 14px; color: #888;">
        <p style="margin: 0;">Thank you for shopping with us!</p>
        <p style="margin: 0;">— The Ramillette Team</p>
      </div>
    </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Delivery email sent to:", toEmail);
  } catch (err) {
    console.error("❌ Error sending delivery email:", err);
  }
}

module.exports = {
  // placeOrder: async (req, res) => {
  //   try {
  //     const {
  //       cart,
  //       address,
  //       note,
  //       totalAmount,
  //       tax,
  //       paymentMethod = "cash on delivery",
  //     } = req.body;

  //     const countryId = req.query.countryId;
  //     const userId = req.userId;

  //     const userData = await User.findById(userId);
  //     if (!userData) {
  //       return res.status(404).json({
  //         isSuccess: false,
  //         message: "User not found.",
  //       });
  //     }

  //     const orderItems = [];
  //     let totalOrderAmount = 0;

  //     for (const item of cart) {
  //       const product = await Product.findById(item.productId);
  //       if (!product) {
  //         return res.status(404).json({
  //           isSuccess: false,
  //           message: `Product with ID ${item.productId._id} not found.`,
  //         });
  //       }

  //       const variant = item.selectedVariant;
  //       if (!variant || typeof variant !== "object") {
  //         return res.status(400).json({
  //           isSuccess: false,
  //           message: `Missing or invalid variant for product "${product.productName}".`,
  //         });
  //       }

  //       // ✅ Check stock availability
  //       if (variant.stock < item.qty) {
  //         return res.status(400).json({
  //           isSuccess: false,
  //           message: `Not enough stock for "${product.productName}" variant "${variant.variantName}". Available: ${variant.stock}, Requested: ${item.qty}`,
  //         });
  //       }

  //       const allVariants = Array.from(product.countryVariants.values()).flat();
  //       const matchedVariant = allVariants.find(
  //         (v) => v._id?.toString() === variant._id?.toString()
  //       );
  //       if (!matchedVariant) {
  //         return res.status(400).json({
  //           isSuccess: false,
  //           message: `Selected variant is no longer available for "${product.productName}".`,
  //         });
  //       }

  //       // ✅ Determine pricing
  //       const originalPrice = variant.price;
  //       const productDiscount = product.productDiscount || 0;
  //       const selectedOffer = item.selectedOffer || null;

  //       let finalPrice = originalPrice;
  //       let appliedDiscount = 0;
  //       let offerInfo = null;

  //       // ✅ Apply Offer if exists
  //       if (selectedOffer) {
  //         offerInfo = {
  //           offerId: selectedOffer.offerId,
  //           title: selectedOffer.title,
  //           offerType: selectedOffer.offerType,
  //           discountType: selectedOffer.discountType,
  //           discountValue: selectedOffer.discountValue,
  //           couponCode: selectedOffer.couponCode || null,
  //         };

  //         if (selectedOffer.offerType === "bogo") {
  //           // BOGO: charge only for buyQuantity items
  //           finalPrice = originalPrice;
  //         } else if (selectedOffer.discountType === "percent") {
  //           appliedDiscount =
  //             (selectedOffer.discountValue / 100) * originalPrice;
  //           finalPrice = originalPrice - appliedDiscount;
  //         } else if (selectedOffer.discountType === "flat") {
  //           appliedDiscount = selectedOffer.discountValue;
  //           finalPrice = Math.max(originalPrice - appliedDiscount, 0);
  //         } else {
  //           finalPrice = originalPrice;
  //         }
  //       } else {
  //         // ✅ No offer → use normal product discount
  //         appliedDiscount = (productDiscount / 100) * originalPrice;
  //         finalPrice = originalPrice - appliedDiscount;
  //       }

  //       const itemTotal = finalPrice * item.qty;
  //       totalOrderAmount += itemTotal;

  //       orderItems.push({
  //         productId: product._id,
  //         qty: item.qty,
  //         productPrice: originalPrice,
  //         productDiscount: productDiscount,
  //         offer: offerInfo, // ✅ Store applied offer for this item
  //         finalPrice,
  //         totalPrice: itemTotal,
  //         variantId: variant._id,
  //         variantName: variant.variantName,
  //       });

  //       // ✅ Update stock
  //       const variantCountryEntry = Array.from(
  //         product.countryVariants.entries()
  //       ).find(([_, variantArray]) =>
  //         variantArray.some((v) => v._id.toString() === variant._id.toString())
  //       );

  //       const variantCountryKey = variantCountryEntry?.[0];
  //       if (variantCountryKey) {
  //         const variantsArray = product.countryVariants.get(variantCountryKey);
  //         const updatedVariants = variantsArray.map((v) =>
  //           v._id.toString() === variant._id.toString()
  //             ? { ...v._doc, stock: v.stock - item.qty }
  //             : v
  //         );
  //         product.countryVariants.set(variantCountryKey, updatedVariants);
  //         await product.save();
  //       }
  //     }

  //     // ✅ Get country info
  //     const countryData = await Country.findById(countryId);

  //     // ✅ Apply Tax
  //     const taxPercentage = tax || 0;
  //     const taxAmount = (taxPercentage / 100) * totalOrderAmount;
  //     const grandTotal = totalOrderAmount + taxAmount;

  //     // ✅ Create Order
  //     const order = new Order({
  //       user: userId,
  //       orderItems,
  //       deliveryAddress: address,
  //       note: note || "",
  //       subTotalPrice: totalOrderAmount,
  //       totalPrice: grandTotal,
  //       tax: taxPercentage,
  //       paymentMethod,
  //       deliverySteps: [{ status: "Order Placed" }, { status: "Processing" }],
  //       currency: countryData.currency,
  //     });

  //     const savedOrder = await order.save();

  //     // ✅ Clear user cart
  //     userData.cart.items = [];
  //     userData.cart.totalPrice = 0;
  //     await userData.save();

  //     // ✅ Optional Email Confirmation
  //     const companyData = await Settings.findOne({});
  //     if (userData.email) {
  //       const emailHtml = generateOrderConfirmationEmail(
  //         { username: userData.firstName, email: userData.email },
  //         savedOrder,
  //         companyData
  //       );
  //       sendEmail({
  //         email: userData.email,
  //         subject: `Your Order #${savedOrder._id} has been confirmed!`,
  //         html: emailHtml,
  //       });
  //     }

  //     return res.status(200).json({
  //       isSuccess: true,
  //       message: "Order placed successfully.",
  //       order: savedOrder,
  //     });
  //   } catch (error) {
  //     console.error("Error while placing the user order:", error);
  //     res.status(500).json({ message: "Internal server error." });
  //   }
  // },
  placeOrder: async (req, res) => {
    try {
      const {
        cart,
        address,
        note,
        subtotal, // ⬅ comes from frontend
        finalTotal, // ⬅ comes from frontend
        newUserOffer, // ⬅ comes from frontend
        tax,
        paymentMethod = "cash on delivery",
      } = req.body;

      const countryId = req.query.countryId;
      const userId = req.userId;

      const userData = await User.findById(userId);
      if (!userData) {
        return res.status(404).json({
          isSuccess: false,
          message: "User not found.",
        });
      }

      const orderItems = [];
      let calculatedSubtotal = 0;

      // -----------------------------------------
      // 🔥 OPTIMIZATION: Fetch ALL products in ONE query instead of N+1
      // -----------------------------------------
      const productIds = cart.map(item => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      const productMap = new Map(products.map(p => [p._id.toString(), p]));

      // -----------------------------------------
      // 🔥 PROCESS EACH CART ITEM
      // -----------------------------------------
      for (const item of cart) {
        const product = productMap.get(item.productId.toString());
        if (!product) {
          return res.status(404).json({
            isSuccess: false,
            message: `Product with ID ${item.productId} not found.`,
          });
        }

        const variant = item.selectedVariant;
        if (!variant) {
          return res.status(400).json({
            isSuccess: false,
            message: `Variant missing for product "${product.productName}".`,
          });
        }

        // 🔥 Stock check
        if (variant.stock < item.qty) {
          return res.status(400).json({
            isSuccess: false,
            message: `Not enough stock for "${product.productName}" variant "${variant.variantName}".`,
          });
        }

        // Confirm selected variant exists in DB
        const allVariants = Array.from(product.countryVariants.values()).flat();
        const matchedVariant = allVariants.find(
          (v) => v._id?.toString() === variant._id?.toString()
        );

        if (!matchedVariant) {
          return res.status(400).json({
            isSuccess: false,
            message: `Selected variant is no longer available for "${product.productName}".`,
          });
        }

        // -----------------------------------------
        // ⭐ APPLY OFFERS (product-level)
        // -----------------------------------------
        const originalPrice = variant.price;
        const productDiscount = product.productDiscount || 0;
        const offer = item.selectedOffer || null;

        let finalPrice = originalPrice;
        let appliedDiscount = 0;
        let offerInfo = null;

        // if (offer) {
        //   offerInfo = {
        //     offerId: offer.offerId,
        //     title: offer.title,
        //     offerType: offer.offerType,
        //     discountType: offer.discountType,
        //     discountValue: offer.discountValue,
        //     couponCode: offer.couponCode || null,
        //   };

        //   if (offer.offerType === "bogo") {
        //     // User pays normal for buyQuantity items
        //     finalPrice = originalPrice;
        //   } else if (offer.discountType === "percent") {
        //     appliedDiscount = (offer.discountValue / 100) * originalPrice;
        //     finalPrice = originalPrice - appliedDiscount;
        //   } else if (offer.discountType === "flat") {
        //     appliedDiscount = offer.discountValue;
        //     finalPrice = Math.max(originalPrice - appliedDiscount, 0);
        //   }
        // } else {
        //   // Apply product-level discount if no offer
        //   appliedDiscount = (productDiscount / 100) * originalPrice;
        //   finalPrice = originalPrice - appliedDiscount;
        // }

        if (offer) {
          offerInfo = {
            offerId: offer.offerId,
            title: offer.title,
            offerType: offer.offerType,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            couponCode: offer.couponCode || null,
          };

          if (offer.offerType === "bogo") {
            // Same as frontend — treat like percentage discount
            appliedDiscount = (offer.discountValue / 100) * originalPrice;
            finalPrice = originalPrice - appliedDiscount;
          } else if (offer.discountType === "percent") {
            appliedDiscount = (offer.discountValue / 100) * originalPrice;
            finalPrice = originalPrice - appliedDiscount;
          } else if (offer.discountType === "flat") {
            appliedDiscount = offer.discountValue;
            finalPrice = Math.max(originalPrice - appliedDiscount, 0);
          }
        } else {
          // Apply product-level discount if no offer selected
          appliedDiscount = (productDiscount / 100) * originalPrice;
          finalPrice = originalPrice - appliedDiscount;
        }

        const itemTotal = finalPrice * item.qty;
        calculatedSubtotal += itemTotal;

        orderItems.push({
          productId: product._id,
          qty: item.qty,
          productPrice: originalPrice,
          productDiscount,
          offer: offerInfo,
          finalPrice,
          totalPrice: itemTotal,
          variantId: variant._id,
          variantName: variant.variantName,
        });

        // -----------------------------------------
        // 🔥 UPDATE STOCK (using arrayFilters for Map-based updates)
        // -----------------------------------------
        const variantCountryEntry = Array.from(
          product.countryVariants.entries()
        ).find(([_, arr]) =>
          arr.some((v) => v._id.toString() === variant._id.toString())
        );

        if (variantCountryEntry) {
          const countryKey = variantCountryEntry[0];
          const variantsArr = product.countryVariants.get(countryKey);
          const updatedVariants = variantsArr.map((v) =>
            v._id.toString() === variant._id.toString()
              ? { ...v._doc, stock: v.stock - item.qty }
              : v
          );
          product.countryVariants.set(countryKey, updatedVariants);
        }
      }

      // -----------------------------------------
      // 🔥 VALIDATE SUBTOTAL TO AVOID HACKING (before saving products)
      // -----------------------------------------
      if (Math.round(calculatedSubtotal) !== Math.round(subtotal)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Subtotal mismatch. Please refresh cart.",
        });
      }

      // -----------------------------------------
      // 🔥 BULK SAVE ALL PRODUCTS (optimized - saves all at once)
      // -----------------------------------------
      await Promise.all(products.map(p => p.save()));

      // -----------------------------------------
      // 🔥 APPLY NEW USER OFFER (cart-level)
      // -----------------------------------------
      let discountedTotal = subtotal;

      if (newUserOffer) {
        const min = newUserOffer.minOrderValue || 0;
        const max = newUserOffer.maxOrderValue || Infinity;

        if (discountedTotal >= min && discountedTotal <= max) {
          if (newUserOffer.discountType === "percent") {
            discountedTotal -=
              (newUserOffer.discountValue / 100) * discountedTotal;
          } else if (newUserOffer.discountType === "flat") {
            discountedTotal = Math.max(
              discountedTotal - newUserOffer.discountValue,
              0
            );
          }
        }
      }

      // -----------------------------------------
      // 🔥 TAX CALCULATION
      // -----------------------------------------
      const taxPercentage = tax || 0;
      const taxAmount = (taxPercentage / 100) * discountedTotal;
      const grandTotal = discountedTotal + taxAmount;

      const countryData = await Country.findById(countryId);

      // -----------------------------------------
      // 🔥 CREATE ORDER
      // -----------------------------------------
      const order = new Order({
        user: userId,
        orderItems,
        deliveryAddress: address,
        note: note || "",
        subTotalPrice: subtotal,
        discountedPrice: discountedTotal,
        totalPrice: grandTotal,
        tax: taxPercentage,
        paymentMethod,
        deliverySteps: [{ status: "Order Placed" }, { status: "Processing" }],
        currency: countryData.currency,
        newUserOffer: newUserOffer || null, // store offer info
      });

      const savedOrder = await order.save();

      // Clear cart
      userData.cart.items = [];
      userData.cart.totalPrice = 0;
      await userData.save();

      // Send email asynchronously (non-blocking)
      if (userData.email) {
        Settings.findOne({}).then(companyData => {
          const emailHtml = generateOrderConfirmationEmail(
            { username: userData.firstName, email: userData.email },
            savedOrder,
            companyData
          );
          sendEmail({
            email: userData.email,
            subject: `Your Order #${savedOrder._id} has been confirmed!`,
            html: emailHtml,
          }).catch(err => console.error("Email send error (non-critical):", err));
        }).catch(err => console.error("Settings fetch error (non-critical):", err));
      }

      return res.status(200).json({
        isSuccess: true,
        message: "Order placed successfully.",
        order: savedOrder,
      });
    } catch (error) {
      console.error("Error while placing the user order:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  // function to get the user orders
  getUserOrders: async (req, res) => {
    try {
      const userId = req.userId;
      const userData = await User.findById(userId).select("_id").lean();

      if (!userData) {
        return res.status(404).json({ error: "User not found." });
      }
      const orders = await Order.find({ user: userData._id })
        .populate({
          path: "orderItems.productId",
          select: "productName productImages productShortName"
        })
        .select("orderItems deliveryAddress totalPrice subTotalPrice discountedPrice tax status paymentMethod currency createdAt deliverySteps shippingMethod")
        .sort({ createdAt: -1 })
        .lean();
      res.status(200).json({
        isSuccess: true,
        message: "User orders fetched successfully",
        orders,
      });
    } catch (error) {
      console.error("Error while getting user orders:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to get all the orders for the admin
  getAllOrders: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const totalOrders = await Order.countDocuments();

      const orders = await Order.find()
        .populate("user", "firstName lastName email")
        .populate("orderItems.productId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.status(200).json({
        isSuccess: true,
        orders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      });
    } catch (error) {
      console.error("Error while getting all orders for admin:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  // function to change the status of the order
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return res
          .status(400)
          .json({ message: "Order ID and status are required." });
      }

      const updateFields = {
        status,
        isDelivered: status === "Delivered",
      };

      if (status === "Delivered") {
        updateFields.deliveredAt = new Date();
        updateFields.isPaid = true;
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        updateFields,
        { new: true }
      ).populate("user");

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found." });
      }
      if (status === "Delivered") {
        await sendDeliverySuccessEmail(updatedOrder.user?.email, updatedOrder);
      }

      res.status(200).json({
        isSuccess: true,
        message: "Order status updated successfully.",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // get order details
  getOrderDetails: async (req, res) => {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Order Id is missing " });
      }
      const order = await Order.findById(orderId)
        .populate("orderItems.productId")
        .populate("user")
        .populate({
          path: "orderItems.offer.offerId",
          model: "Offer",
          populate: [
            {
              path: "buyProductId",
              model: "Product",
              select: "productName productImages",
            },
            {
              path: "getProductId",
              model: "Product",
              select: "productName productImages",
            },
          ],
        });

      if (!orderId) {
        return res.status(404).json({
          isSuccess: false,
          message: "The order data is not available",
        });
      }

      res.status(200).json({
        isSuccess: true,
        message: "Order details fetched successfully",
        order,
      });
    } catch (error) {
      console.error("Error while getting order details:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to cancel the order by user
  cancelOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if already delivered
      if (order.isDelivered || order.status === "Delivered") {
        return res.status(400).json({
          message: "Cannot cancel order that has already been delivered.",
        });
      }

      // If already cancelled, no need to update again
      if (order.status === "Cancelled") {
        return res.status(400).json({ message: "Order is already cancelled." });
      }

      // Update status
      order.status = "Cancellation In Progress";
      order.cancellationReason = reason;
      await order.save();

      return res
        .status(200)
        .json({ isSuccess: true, message: "Order cancelled successfully." });
    } catch (error) {
      console.error("Error while cancelling order by user:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to place a order of single item
  // placeSingleOrder: async (req, res) => {
  //   try {
  //     const {
  //       product,
  //       address,
  //       countryId,
  //       paymentMethod = "cash on delivery",
  //       selectedVariant
  //     } = req.body;

  //     console.log(req.body,'req.body')

  //     if (!product || !address || !countryId||!selectedVariant) {
  //       return res
  //         .status(400)
  //         .json({ message: "Missing product, address,selectedVariant or countryId" });
  //     }

  //     const userId = req.userId;
  //     const userData = await User.findById(userId);

  //     // Fetch the product
  //     const productData = await Product.findById(product._id).populate(
  //       "countryPrices.country"
  //     );
  //     if (!productData) {
  //       return res.status(404).json({ message: "Product not found" });
  //     }
  //     if (productData.productStock < product.quantity) {
  //       return res.status(400).json({
  //         isSuccess: false,
  //         message: `Not enough stock for "${productData.productName}".`,
  //       });
  //     }
  //     const isAvailableInCountry = productData.countries.some(
  //       (c) => c.toString() === countryId
  //     );
  //     if (!isAvailableInCountry) {
  //       return res.status(400).json({
  //         isSuccess: false,
  //         message: `"${productData.productName}" is not available in the selected country.`,
  //       });
  //     }
  //     const countryPriceObj = productData.countryPrices.find(
  //       (cp) => cp.country._id.toString() === countryId
  //     );

  //     if (!countryPriceObj) {
  //       return res.status(400).json({
  //         error: `No price available for "${productData.productName}" in selected country.`,
  //       });
  //     }
  //     const originalPrice = countryPriceObj.price;
  //     const discount = productData.productDiscount || 0;
  //     const finalPrice = originalPrice - (originalPrice * discount) / 100;
  //     const totalPriceBeforeTax = finalPrice * product.quantity;
  //     const taxData = await Tax.findOne({ country: countryId });
  //     const taxPercentage = taxData ? taxData.taxPercentage : 0;
  //     const taxAmount = (totalPriceBeforeTax * taxPercentage) / 100;

  //     const totalPriceWithTax = totalPriceBeforeTax + taxAmount;

  //     const orderItem = {
  //       productId: productData._id,
  //       qty: product.quantity,
  //       productPrice: originalPrice,
  //       productDiscount: discount,
  //       finalPrice,
  //     };

  //     const countryData = await Country.findById(countryId);

  //     await Product.findByIdAndUpdate(productData._id, {
  //       $inc: { productStock: -product.quantity },
  //     });

  //     const order = new Order({
  //       user: userId,
  //       orderItems: [orderItem],
  //       deliveryAddress: address,
  //       note: address.note || "",
  //       subTotalPrice: totalPriceWithTax,
  //       totalPrice: totalPriceBeforeTax,
  //       tax: taxData.taxPercentage,
  //       paymentMethod,
  //       deliverySteps: [
  //         {
  //           status: "Order Placed",
  //         },
  //         {
  //           status: "Processing",
  //         },
  //       ],
  //       currency: countryData.currency,
  //     });
  //     const savedOrder = await order.save();
  //     const companyData = await Settings.findOne({});
  //     if (userData.email) {
  //       const emailHtml = generateOrderConfirmationEmail(
  //         { username: userData.firstName, email: userData.email },
  //         savedOrder,
  //         companyData
  //       );
  //       // Send the email in a non-blocking way
  //       sendEmail({
  //         email: userData.email,
  //         subject: `Your Order #${savedOrder._id} has been confirmed!`,
  //         html: emailHtml,
  //       });
  //     }
  //     return res.status(200).json({
  //       isSuccess: true,
  //       message: "Order placed successfully.",
  //       order: savedOrder,
  //     });
  //   } catch (error) {
  //     console.error("Error while placing order of single item by user:", error);
  //     res.status(500).json({ message: "Internal server error." });
  //   }
  // },
  placeSingleOrder: async (req, res) => {
    try {
      const {
        product,
        address,
        countryId,
        paymentMethod = "cash on delivery",
        selectedVariant,
      } = req.body;

      if (!product || !address || !countryId || !selectedVariant) {
        return res.status(400).json({
          isSuccess: false,
          message: "Missing product, address, selectedVariant or countryId.",
        });
      }

      const userId = req.userId;
      const userData = await User.findById(userId);

      const productData = await Product.findById(product._id);
      if (!productData) {
        return res.status(404).json({
          isSuccess: false,
          message: "Product not found",
        });
      }

      // Step 1: Get the variant list for the country
      const variantsForCountry = productData.countryVariants.get
        ? productData.countryVariants.get(countryId)
        : productData.countryVariants[countryId];

      if (!variantsForCountry || !Array.isArray(variantsForCountry)) {
        return res.status(400).json({
          isSuccess: false,
          message: "No variants available for selected country.",
        });
      }

      // Step 2: Find the selected variant
      const selectedVariantData = variantsForCountry.find(
        (v) => v._id.toString() === selectedVariant._id
      );

      if (!selectedVariantData) {
        return res.status(400).json({
          isSuccess: false,
          message: "Selected variant not found for the selected country.",
        });
      }

      // Step 3: Check stock
      if (selectedVariantData.stock < product.quantity) {
        return res.status(400).json({
          isSuccess: false,
          message: `Not enough stock for selected variant of "${productData.productName}".`,
        });
      }

      // Step 4: Price calculations
      const originalPrice = selectedVariantData.price;
      const discount = productData.productDiscount || 0;
      const finalPrice = originalPrice - (originalPrice * discount) / 100;
      const totalPriceBeforeTax = finalPrice * product.quantity;

      const taxData = await Tax.findOne({ country: countryId });
      const taxPercentage = taxData ? taxData.taxPercentage : 0;
      const taxAmount = (totalPriceBeforeTax * taxPercentage) / 100;
      const totalPriceWithTax = totalPriceBeforeTax + taxAmount;

      // Step 5: Create order item
      const orderItem = {
        productId: productData._id,
        variantId: selectedVariantData._id,
        variantName: selectedVariantData.variantName,
        qty: product.quantity,
        productPrice: originalPrice,
        productDiscount: discount,
        finalPrice,
      };

      const countryData = await Country.findById(countryId);

      // Step 6: Decrease stock
      const response = await Product.updateOne(
        { _id: productData._id },
        {
          $inc: {
            [`countryVariants.${countryId}.$[elem].stock`]: -product.quantity,
          },
        },
        {
          arrayFilters: [{ "elem._id": selectedVariantData._id }],
        }
      );

      // Step 7: Create and save order
      const order = new Order({
        user: userId,
        orderItems: [orderItem],
        deliveryAddress: address,
        note: address.note || "",
        subTotalPrice: totalPriceWithTax,
        totalPrice: totalPriceBeforeTax,
        tax: taxPercentage,
        paymentMethod,
        deliverySteps: [{ status: "Order Placed" }, { status: "Processing" }],
        currency: countryData.currency,
      });

      console.log(order, "orderorderorder");

      const savedOrder = await order.save();

      // Step 8: Send email
      const companyData = await Settings.findOne({});
      if (userData.email) {
        const emailHtml = generateOrderConfirmationEmail(
          { username: userData.firstName, email: userData.email },
          savedOrder,
          companyData
        );
        sendEmail({
          email: userData.email,
          subject: `Your Order #${savedOrder._id} has been confirmed!`,
          html: emailHtml,
        });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "Order placed successfully.",
        order: savedOrder,
      });
    } catch (error) {
      console.error("Error while placing single product order:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to update the order shipping details
  updateShippingDetails: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { shippingMethod } = req.body;
      console.log(req.body);
      const updatePayload = {
        $set: {
          shippingMethod: {
            courierPartner: shippingMethod.courierPartner,
            estimatedDeliveryDate: shippingMethod.estimatedDeliveryDate,
            name: shippingMethod.name,
            trackingId: shippingMethod.trackingId,
          },
        },
      };

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        updatePayload,
        {
          new: true,
        }
      );

      if (!updatedOrder) {
        return res.status(404).json({
          isSuccess: false,
          message: "Order not found",
        });
      }

      res.status(200).json({
        isSuccess: true,
        message: "Shipping details updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Error while updating the shipping details:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to change the cancel the order by admin
  cancelOrderByAdmin: async (req, res) => {
    try {
      const { orderId } = req.params;

      const { reason } = req.body;
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid order ID.",
        });
      }

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          isSuccess: false,
          message: "Order not found.",
        });
      }

      if (order.status === "Cancelled") {
        return res.status(400).json({
          isSuccess: false,
          message: "Order is already cancelled.",
        });
      }

      order.status = "Cancelled";
      order.isCancelledByAdmin = true;
      order.cancellationReason = reason;
      await order.save();

      return res.status(200).json({
        isSuccess: true,
        message: "Order cancelled successfully.",
        order,
      });
    } catch (error) {
      console.error("Error while cancelling the order by admin:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to update the order delivery status
  updateDeliveryStep: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Order not found" });
      }

      // Prevent duplicate entries
      const alreadyExists = order.deliverySteps.some(
        (step) => step.status === status
      );
      if (!alreadyExists) {
        order.deliverySteps.push({ status, updatedAt: new Date() });
      }

      // Update current status
      order.status = status;
      if (status === "Delivered") {
        order.isPaid = true;
        order.isDelivered = true;
      }

      await order.save();

      res.json({
        isSuccess: true,
        message: "Order status updated successfully",
        updatedOrder: order,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  },
  // function to update the order status for many orders(bulk)
  bulkOrderStatusUpdate: async (req, res) => {
    try {
      const { status, selectedOrders } = req.body;

      if (
        !status ||
        !Array.isArray(selectedOrders) ||
        selectedOrders.length === 0
      ) {
        return res.status(400).json({
          isSuccess: false,
          message: "Status and selected orders are required.",
        });
      }
      const result = await Order.updateMany(
        { _id: { $in: selectedOrders } },
        {
          $set: { status, isCancelledByAdmin: false },
        }
      );
      return res.status(200).json({
        isSuccess: true,
        message: `Updated ${result.modifiedCount} order(s) successfully.`,
      });
    } catch (error) {
      console.error("Failed to update bulk order status:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  },
};
