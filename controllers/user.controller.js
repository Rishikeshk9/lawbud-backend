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

exports.addReview = async (req, res, next) => {
  try {
    const { review_msg, reviewer, rating, reviewed_on, timestamp } = req.body;
    const user = await User.findOne({ user_id: reviewed_on });
    const review_id = makeId(7);
    const reviewData = {
      review_id: review_id,
      review_msg: review_msg,
      reviewer: reviewer,
      rating: rating,
      timestamp: timestamp,
    };
    if (!user?.reviews) {
      user.reviews = [];
      user.reviews.push(reviewData);
      user.save();
    } else {
      user.reviews.push(reviewData);
      user.save();
    }
    return res.status(200).json({
      status: "success",
      message: "review added successfully",
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const user = await User.findOne({ user_id: user_id });
    const reviews = user?.reviews ? user.reviews : {};
    return res.status(200).json({
      status: "success",
      message: "user reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { review_msg, reviewer, rating, reviewed_on, timestamp, review_id } =
      req.body;
    const user = await User.findOne({ user_id: reviewed_on });
    const reviews = user?.reviews;
    let toUpdate = -1;
    if (reviews.length > 0) {
      reviews.forEach((element, key) => {
        console.log(element.review_id, review_id);
        if (element.review_id === review_id) {
          toUpdate = key;
        }
      });
    }
    console.log(toUpdate);
    if (toUpdate > -1) {
      const updatedData = {
        review_id: review_id,
        review_msg: review_msg,
        reviewer: reviewer,
        rating: rating,
        timestamp: timestamp,
      };
      reviews[toUpdate] = updatedData;
      user.reviews = reviews;
      user.save();
      return res.status(200).json({
        status: "success",
        message: "review updated successfully",
      });
    } else {
      return res.status(400).json({
        status: "failed",
        message: "review not found",
      });
    }
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { user_id, review_id } = req.body;
    if (user_id) {
      const user = await User.findOne({ user_id: user_id });
      const reviews = user?.reviews;
      let toDelete = -1;
      if (reviews.length > 0) {
        reviews.forEach((element, key) => {
          if (element.review_id === review_id) {
            toDelete = key;
          }
        });
      }
      if (toDelete > -1) {
        reviews.splice(toDelete, 1);
        user.reviews = reviews;
        user.save();
        return res.status(200).json({
          status: "success",
          message: "review deleted successfully",
        });
      } else {
        return res.status(400).json({
          status: "failed",
          message: "review not found",
        });
      }
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

exports.addReport = async (req, res, next) => {
  try {
    const { reporter, reported_on, timestamp } = req.body;
    const user = await User.findOne({ user_id: reported_on });
    const report_id = makeId(7);
    const reportData = {
      report_id: report_id,
      reporter: reporter,
      timestamp: timestamp,
    };
    if (!user?.reports) {
      user.reports = [];
      user.reports.push(reportData);
      user.save();
    } else {
      user.reports.push(reportData);
      user.save();
    }
    return res.status(200).json({
      status: "success",
      message: "report added successfully",
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const user = await User.findOne({ user_id: user_id });
    const reports = user?.reports ? user.reports : {};
    return res.status(200).json({
      status: "success",
      message: "user reports fetched successfully",
      data: reports,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.updateReport = async (req, res, next) => {
  try {
    const { reporter, reported_on, timestamp, report_id } = req.body;
    const user = await User.findOne({ user_id: reported_on });
    const reports = user?.reports;
    let toUpdate = -1;
    if (reports.length > 0) {
      reports.forEach((element, key) => {
        if (element.report_id === report_id) {
          toUpdate = key;
        }
      });
    }
    if (toUpdate > -1) {
      const updatedData = {
        report_id: report_id,
        reporter: reporter,
        timestamp: timestamp,
      };
      reports[toUpdate] = updatedData;
      user.reports = reports;
      user.save();
      return res.status(200).json({
        status: "success",
        message: "report updated successfully",
      });
    } else {
      return res.status(400).json({
        status: "failed",
        message: "report not found",
      });
    }
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const { user_id, report_id } = req.body;
    if (user_id) {
      const user = await User.findOne({ user_id: user_id });
      const reports = user?.reports;
      let toDelete = -1;
      if (reports.length > 0) {
        reports.forEach((element, key) => {
          if (element.report_id === report_id) {
            toDelete = key;
          }
        });
      }
      if (toDelete > -1) {
        reports.splice(toDelete, 1);
        user.reports = reports;
        user.save();
        return res.status(200).json({
          status: "success",
          message: "report deleted successfully",
        });
      } else {
        return res.status(400).json({
          status: "failed",
          message: "report not found",
        });
      }
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

exports.addRating = async (req, res, next) => {
  try {
    const { reviewer, rating, reviewed_on, timestamp } = req.body;
    const user = await User.findOne({ user_id: reviewed_on });
    const review_id = makeId(7);
    const reviewData = {
      review_id: review_id,
      reviewer: reviewer,
      rating: rating,
      timestamp: timestamp,
    };
    if (!user?.reviews) {
      user.reviews = [];
      user.reviews.push(reviewData);
      user.save();
    } else {
      user.reviews.push(reviewData);
      user.save();
    }
    return res.status(200).json({
      status: "success",
      message: "rating added successfully",
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.getRating = async (req, res, next) => {
  try {
    const user_id = req.params.userId;
    const user = await User.findOne({ user_id: user_id });
    const reviews = user?.reviews ? user.reviews : {};
    return res.status(200).json({
      status: "success",
      message: "user ratings fetched successfully",
      data: reviews,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.updateRating = async (req, res, next) => {
  try {
    const { reviewer, rating, reviewed_on, timestamp, review_id } = req.body;
    const user = await User.findOne({ user_id: reviewed_on });
    const reviews = user?.reviews;
    let toUpdate = -1;
    if (reviews.length > 0) {
      reviews.forEach((element, key) => {
        console.log(element.review_id, review_id);
        if (element.review_id === review_id) {
          toUpdate = key;
        }
      });
    }
    console.log(toUpdate);
    if (toUpdate > -1) {
      const updatedData = {
        review_id: review_id,
        reviewer: reviewer,
        rating: rating,
        timestamp: timestamp,
      };
      reviews[toUpdate] = updatedData;
      user.reviews = reviews;
      user.save();
      return res.status(200).json({
        status: "success",
        message: "rating updated successfully",
      });
    } else {
      return res.status(400).json({
        status: "failed",
        message: "rating not found",
      });
    }
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
};

exports.deleteRating = async (req, res, next) => {
  try {
    const { user_id, review_id } = req.body;
    if (user_id) {
      const user = await User.findOne({ user_id: user_id });
      const reviews = user?.reviews;
      let toDelete = -1;
      if (reviews.length > 0) {
        reviews.forEach((element, key) => {
          if (element.review_id === review_id) {
            toDelete = key;
          }
        });
      }
      if (toDelete > -1) {
        reviews.splice(toDelete, 1);
        user.reviews = reviews;
        user.save();
        return res.status(200).json({
          status: "success",
          message: "rating deleted successfully",
        });
      } else {
        return res.status(400).json({
          status: "failed",
          message: "rating not found",
        });
      }
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
