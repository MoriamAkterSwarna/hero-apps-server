const express = require("express");
const router = express.Router();
const { adminMiddleware } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  deleteUser,
  blockUser,
  getStats,
} = require("../controllers/admin.controller");

router.get("/users", adminMiddleware, getAllUsers);
router.get("/stats", adminMiddleware, getStats);
router.delete("/user/:id", adminMiddleware, deleteUser);
router.put("/block/:id", adminMiddleware, blockUser);

module.exports = router;
