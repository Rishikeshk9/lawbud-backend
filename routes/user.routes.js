const express = require("express");
const user = require("../controllers/user.controller");
const userAuthentication = require("../middleware/userAuthentication");

const router = express.Router();
router.post("/addUser", user.addUser);
router.get("/getUser/:userId", userAuthentication, user.getUser);
router.get("/getAllUsers", user.getAllUsers);
router.post("/updateUser", userAuthentication, user.updateUser);
router.post("/deleteUser", userAuthentication, user.deleteUser);

module.exports = router;
