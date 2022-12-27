const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new Schema(
  {
    userId: {
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
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    jwt_token: {
      type: String,
    },
    resetToken: String,
    expireToken: Date,
     
    password: {
      type: String,
      default: false,
      required: false,
    }, 
    profile_image: {
      type: String,
      default: '',
    }, 
    notification: {
      type: Array,
      default: [],
    },
    oldnotification: {
      type: Array,
      default: [],
    }, 
    reports: {
      type: Array,
      default: [],
    },
    refer: {
      type: Object,

      default: false,
    },
    seenIntro: {
      type: String,
      default: 'notseen',
    }, 
    preference: {
      type: String,
      required: false,
    },
    conversations: {
      type: Array,
      default: [],
    },
    userType:{
      type: String,
      default: 'user', 
    },
    sanatNumber:{
      type: String,
      default: '',
      trim: true,
    },
    degree:{
      type: String, 
      default: '',
    },
    bar:{
      type: String, 
      default: '',
    },
    experience:{
      type: String,
      default: '',
    },
    specialization:{
      type: Array,
      default: [],
    },
    address:{
      type: String, 
      default: '',
      trim: true,
    },
    phone:{
      required:true,
      type: String,
      trim: true,
      minlength: 10,
      length: 10,
    },
    altPhone:{

      type: String,
      trim: true,
      minlength: 10,
      length: 10,
    },
    ratings:{
      type: Array, 
      default:[],
    },
    reviews:{
      type: Array,
      default: [],
    },
    bio:{
      type: String,
      trim: true,
    },
    verified:{
      type: Boolean,
      default: false,
    }

  },
  {
    timestamps: true,
  },
);

userSchema.methods.generateAuthToken = async function (res) {
  try {
    const token = jwt.sign(
      { _id: this._id.toString() },
      'mynameislawbud',
    );
    this.jwt_token = token;
    await this.save();
    return token;
  } catch (error) {
    console.log('error is' + error);
    res.send('error is' + error);
  }
};

const User = mongoose.model('user', userSchema);
module.exports = User;
