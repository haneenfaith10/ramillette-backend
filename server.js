const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

// routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoute");
const brandRoutes = require("./routes/brandRoutes");
const settingsRoutes = require("./routes/settingsRoute");
const orderRoutes = require("./routes/orderRoutes");
const countryRoutes = require("./routes/countryRoute");
const bannerRoutes = require("./routes/bannerRoute");
const videoBannerRoutes = require("./routes/videoBannerRoute");
const taxRoutes = require("./routes/taxRoute");
const reviewRoutes = require("./routes/ratingRoute");
const socialLinks = require("./routes/socialMediaRoutes");
const bestSellerRoute = require("./routes/bestSellerRoute");
const badgeRoute = require("./routes/badgeRoutes");
const providerRoutes = require("./routes/shippingProviderRoute");
const alertRoutes = require("./routes/alertRoutes");
const offerRoutes = require("./routes/offerRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");

const app = express();

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB(); //connecting the database

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use("/api/user", userRoutes);
app.use("/api/admin/", adminRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/country", countryRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/videoBanner", videoBannerRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/socialLinks", socialLinks);
app.use("/api/bestSeller", bestSellerRoute);
app.use("/api/badge", badgeRoute);
app.use("/api/providers", providerRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/testimonial",testimonialRoutes)

app.listen(port, () => {
  console.log(`server is running at port ${port} ⚡`);
});
