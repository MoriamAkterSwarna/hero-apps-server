const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    const db = getDB();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "Your account has been blocked." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired." });
    }
    res.status(500).json({ error: "Authentication failed." });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    const db = getDB();
    const admin = await db.collection("admins").findOne(
      { _id: new ObjectId(decoded.adminId) }
    );

    if (!admin) {
      return res.status(403).json({ error: "Admin access required." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication failed." });
  }
};

module.exports = { authMiddleware, adminMiddleware };
