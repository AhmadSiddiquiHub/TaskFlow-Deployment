const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    if (!conn) {
      return console.log("MongoDB Connection Failed!");
    }
    console.log();
    return console.log(
      `MongoDB Connected Successfully! ${conn.connection.host}`
    );
  } catch (error) {
    return console.log(error);
  }
};

module.exports = connectDB;
