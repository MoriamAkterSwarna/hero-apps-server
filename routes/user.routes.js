const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getUserById,
  updateUser,
  uploadProfilePhoto,
  uploadGalleryPhoto,
  getMatchedProfiles,
  logout,
} = require("../controllers/user.controller");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/", authMiddleware, getAllUsers);
router.get("/matches", authMiddleware, getMatchedProfiles);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.post("/upload/profile", authMiddleware, upload.single("photo"), uploadProfilePhoto);
router.post("/upload/gallery", authMiddleware, upload.single("photo"), uploadGalleryPhoto);
router.post("/logout", authMiddleware, logout);

module.exports = router;
