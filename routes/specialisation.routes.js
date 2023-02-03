const express = require("express");
const specialisation = require("../controllers/specialisation.controller");
const router = express.Router();

router.post("/addSpecialisation", specialisation.addSpecialisation);
router.get(
  "/getSpecialisation/:specialisationId",
  specialisation.getSpecialisation
);
router.get("/getAllSpecialisations", specialisation.getAllSpecialisations);
router.post("/updateSpecialisation", specialisation.updateSpecialisation);
router.post("/deleteSpecialisation", specialisation.deleteSpecialisation);

module.exports = router;
