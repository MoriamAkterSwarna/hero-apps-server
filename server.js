require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const interestRoutes = require("./routes/interest.routes");
const messageRoutes = require("./routes/message.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Matrimony API is running", status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === "Only image files are allowed.") {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Something went wrong!" });
});

// Connect to DB on first request (for serverless)
let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  next();
});

// Start server (for local development)
const startServer = async () => {
  await connectDB();
  dbConnected = true;

  // Create uploads directory if it doesn't exist
  const fs = require("fs");
  const uploadsDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Only start server locally (not on Vercel)
if (process.env.VERCEL !== "1") {
  startServer();
}

// Export for Vercel serverless
module.exports = app;
