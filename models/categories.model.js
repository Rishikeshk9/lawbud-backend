const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const categorySchema = new Schema(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 5,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },  
  },
  {
    timestamps: true,
  },
);
 

const category = mongoose.model('category', categorySchema);
module.exports = category;
