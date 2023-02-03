const express = require("express");
const user = require("../controllers/user.controller");

const router = express.Router();
router.post("/addUser", user.addUser);
router.get("/getUser/:userId", user.getUser);
router.get("/getAllUsers", user.getAllUsers);
router.post("/updateUser", user.updateUser);
router.post("/deleteUser", user.deleteUser);

module.exports = router;
