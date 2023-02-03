const User = require("../models/user.model");
const makeId = require("../utils/makeId");

exports.addUser = async (req, res, next) => {
  try {
    console.log(req.body);
    const {
      name,
      email_id,
      contact,
      alternate_contact,
      profile_image,
      type,
      languages,
      user_law_data,
      bio,
      address,
      reports,
    } = req.body;
    const user = new User();
    user.user_id = makeId(7);
    user.name = name;
    user.email_id = email_id;
    user.contact = contact;
    user.alternate_contact = alternate_contact;
    user.profile_image = profile_image;
    user.type = type;
    user.languages = languages;
    user.user_law_data = user_law_data;
    user.bio = bio;
    user.address = address;
    user.reports = reports;
    user.createdAt = new Date();
    const authToken = await user.generateAuthToken();
    await user.save();
    return res.status(200).json({
      status: "success",
      message: "user created successfully",
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const user = await User.findOne({ user_id: user_id });
    return res.status(200).json({
      status: "success",
      message: "user details fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const user = await User.find();
    return res.status(200).json({
      status: "success",
      message: "users fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const {
      name,
      email_id,
      contact,
      alternate_contact,
      profile_image,
      type,
      languages,
      user_law_data,
      bio,
      address,
      reports,
      user_id,
    } = req.body;
    const user = await User.findOne({ user_id: user_id });
    user.name = name;
    user.email_id = email_id;
    user.contact = contact;
    user.alternate_contact = alternate_contact;
    user.profile_image = profile_image;
    user.type = type;
    user.languages = languages;
    user.user_law_data = user_law_data;
    user.bio = bio;
    user.address = address;
    user.reports = reports;
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

exports.deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    if (user_id) {
      await User.deleteOne({ user_id: user_id });
      return res.status(200).json({
        status: "success",
        message: "user deleted successfully",
      });
    } else {
      return res.status(400).json({
        status: "failed",
        message: "please provide user id",
      });
    }
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};
