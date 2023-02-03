const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const userSchema = Schema({
  user_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email_id: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
    required: true,
  },
  alternate_contact: {
    type: Number,
  },
  profile_image: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  languages: {
    type: Array,
    default: [],
  },
  user_law_data: {
    type: Object,
    default: {
      experience: {
        type: Number,
      },
      specialisation: {
        type: Object,
        default: {
          id: {
            type: String,
          },
          category: {
            type: String,
          },
        },
      },
      sanat: {
        type: Number,
      },
      degree: {
        type: Object,
        default: {
          id: {
            type: String,
          },
          file: {
            type: String,
          },
        },
      },
      bar_membership: {
        type: Object,
        default: {
          id: {
            type: String,
          },
          file: {
            type: String,
          },
        },
      },
      ratings: {
        type: Object,
        default: {
          from_user_id: {
            type: String,
          },
          rate: {
            type: Number,
          },
        },
      },
      reviews: {
        type: Object,
        default: {
          from_user_id: {
            type: String,
          },
          review: {
            type: String,
          },
        },
      },
    },
  },
  bio: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  reports: {
    type: Object,
    default: {
      from_user_id: {
        type: String,
      },
      report: {
        type: String,
      },
    },
  },
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    required: true,
  },
});

// userSchema.methods.generateAuthToken = async function () {
//   try {
//     const token = jwt.sign({ _id: this._id.toString() }, JWT_SECRET);
//     this.tokens = this.tokens.concat({ token: token });
//     await this.save();
//     return token;
//   } catch (error) {
//     console.log(error);
//   }
// };

const User = mongoose.model("User", userSchema);
module.exports = User;
