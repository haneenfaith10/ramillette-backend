const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    await mongoose.connect(process.env.MONGO_SERVER, options).then(() => {
      console.log("MongoDB connected successfully.....✅");
    });
  } catch (error) {
    console.error(error);
    console.error(" MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDb;
