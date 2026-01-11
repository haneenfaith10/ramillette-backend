const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_SERVER).then(() => {
      console.log("MongoDB connected successfully.....✅");
    });
  } catch (error) {
    console.error(error);
    console.error(" MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDb;
