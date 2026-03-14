const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  sendInterest,
  respondToInterest,
  getMyInterests,
} = require("../controllers/interest.controller");

router.post("/send", authMiddleware, sendInterest);
router.put("/respond", authMiddleware, respondToInterest);
router.get("/my", authMiddleware, getMyInterests);

module.exports = router;
