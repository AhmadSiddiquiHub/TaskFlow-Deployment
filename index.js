const express = require("express");
const app = express();
const cors = require("cors");

// Import Files
const userRoute = require("./routes/userRoutes.routes");
const todoRoute = require("./routes/todoRoutes.routes");
const connectDB = require("./DB/db");
const { errorHandler } = require("./middlewares/errorHandler");
const path = require("path");

// Configuring Dotenv
require("dotenv").config();

// Connecting Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/todo", todoRoute);

app.get("/", (req, res) => {
  res.send("Hello, From the Server!!!");
});

// Static Files
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Error Handler Middleware
app.use(errorHandler);

// Server Listen
app.listen(port, () => {
  console.log(`Server is Listening on Port ${port}`);
});
