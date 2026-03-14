const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");
const { validateRegistration, calculateAge, sanitizeUser } = require("../utils/helpers");

const register = async (req, res) => {
  try {
    const {
      fullName, email, password, gender, dateOfBirth,
      religion, education, profession, location, bio
    } = req.body;

    const errors = validateRegistration(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = getDB();
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      gender: gender.toLowerCase(),
      dateOfBirth: new Date(dateOfBirth),
      age: calculateAge(dateOfBirth),
      religion: religion || "",
      education: education || "",
      profession: profession || "",
      location: location || "",
      bio: bio || "",
      height: "",
      income: "",
      maritalStatus: "never_married",
      profilePhoto: "",
      galleryPhotos: [],
      preferences: {
        preferredAgeRange: { min: 18, max: 60 },
        preferredLocation: "",
        preferredReligion: "",
      },
      isBlocked: false,
      isOnline: false,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    const token = jwt.sign(
      { userId: result.insertedId },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    const { password: _, ...userWithoutPassword } = newUser;
    userWithoutPassword._id = result.insertedId;

    res.status(201).json({
      message: "Registration successful.",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const db = getDB();
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "Your account has been blocked." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Update online status
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { isOnline: true, lastSeen: new Date() } }
    );

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed." });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const db = getDB();
    const admin = await db.collection("admins").findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Admin login successful.",
      token,
      admin: { _id: admin._id, email: admin.email, name: admin.name },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed." });
  }
};

module.exports = { register, login, adminLogin };
