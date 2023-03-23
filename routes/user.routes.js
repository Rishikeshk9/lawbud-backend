const express = require("express");
const user = require("../controllers/user.controller");
const userAuthentication = require("../middleware/userAuthentication");

const router = express.Router();
router.post("/addUser", user.addUser);
router.get("/getUser/:userId", userAuthentication, user.getUser);
router.get("/getAllUsers", user.getAllUsers);
router.post("/updateUser", userAuthentication, user.updateUser);
router.post("/deleteUser", userAuthentication, user.deleteUser);
router.post("/addReview", user.addReview);
router.get("/getReview/:userId", user.getReview);
router.post("/updateReview", user.updateReview);
router.post("/deleteReview", user.deleteReview);
router.post("/addReport", user.addReport);
router.get("/getReport/:userId", user.getReport);
router.post("/updateReport", user.updateReport);
router.post("/deleteReport", user.deleteReport);
router.post("/addRating", user.addRating);
router.get("/getRating/:userId", user.getRating);
router.post("/updateRating", user.updateRating);
router.post("/deleteRating", user.deleteRating);

module.exports = router;
