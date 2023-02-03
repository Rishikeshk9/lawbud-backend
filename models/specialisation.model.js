const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const specialisationSchema = Schema({
  specialisation_id: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

const Specialisation = mongoose.model("Specialisation", specialisationSchema);
module.exports = Specialisation;
