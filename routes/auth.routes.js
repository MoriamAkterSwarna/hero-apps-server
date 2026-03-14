const express = require("express");
const router = express.Router();
const { register, login, adminLogin } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);

module.exports = router;
