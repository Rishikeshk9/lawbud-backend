const express = require("express");
const email = require("../controllers/email.controller");

const router = express.Router();
router.post("/send_email", email.sendEmail);

module.exports = router;
