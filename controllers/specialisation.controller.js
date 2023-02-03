const Specialisation = require("../models/specialisation.model");
const makeId = require("../utils/makeId");

exports.addSpecialisation = async (req, res, next) => {
  try {
    console.log(req.body);
    const { name } = req.body;
    const specialisation = new Specialisation();
    specialisation.specialisation_id = makeId(7);
    specialisation.name = name;
    specialisation.createdAt = new Date();
    await specialisation.save();
    return res.status(200).json({
      status: "success",
      message: "specialisation created successfully",
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.getSpecialisation = async (req, res, next) => {
  try {
    const specialisation_id = req.params.specialisationId;
    const specialisation = await Specialisation.findOne({
      specialisation_id: specialisation_id,
    });
    return res.status(200).json({
      status: "success",
      message: "specialisation details fetched successfully",
      data: specialisation,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.getAllSpecialisations = async (req, res, next) => {
  try {
    const specialisation = await Specialisation.find();
    return res.status(200).json({
      status: "success",
      message: "specialisations fetched successfully",
      data: specialisation,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.updateSpecialisation = async (req, res, next) => {
  try {
    const { name, specialisation_id } = req.body;
    const specialisation = await Specialisation.findOne({
      specialisation_id: specialisation_id,
    });
    specialisation.name = name;
    specialisation.specialisation_id = specialisation_id;
    await user.save();
    return res.status(200).json({
      status: "success",
      message: "user details updated successfully",
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.deleteSpecialisation = async (req, res, next) => {
  try {
    const { specialisation_id } = req.body;
    if (specialisation_id) {
      await Specialisation.deleteOne({ specialisation_id: specialisation_id });
      return res.status(200).json({
        status: "success",
        message: "specialisation deleted successfully",
      });
    } else {
      return res.status(400).json({
        status: "failed",
        message: "please provide specialisation id",
      });
    }
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};
