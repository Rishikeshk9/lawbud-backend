const router = require('express').Router();
const Str = require('@supercharge/strings');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const jwt = require('jsonwebtoken');
let category = require('../../models/categories.model');
const JWT_SECRET = "iamironman";
const userMiddleware = require('../../helper/userMiddleware'); 
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API,
    },
  }),
);

// CHECKED
router.route('/').get(async (req, res) => {
  category.find()
    .then((categories) => res.json(categories))
    .catch((err) => res.status(400).json('Error: ' + err));
});

router.route('/delete').post(async (req, res) => {
  try {
    const Category = await category.findOne({categoryId: req.body.categoryId});
    if (!Category) {
      return res.status(400).json('category not found');
    }
    await category.remove(); 
    res.json("category deleted");
  }
  catch (err) {
    return res.status(400).json('Error:'+ err);
  }
});

// To Get Current User User Login Required
router
  .route('/getLoggedInUser')
  .get(userMiddleware, async (req, res) => {
    try {
      const loggedInId = req.user_id;
      const loggedInUser = await User.findById(loggedInId).select(
        '-password',
      );

      if (loggedInUser) {
        res.json(loggedInUser);
      } else {
        res.status(404).send({ message: 'No Users Found' });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  });

/**
 * @swagger
 * /user/add:
 *   post:
 *     summary: Add a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *                 email:
 *                   type: string
 *                   default: youremai@gmail.com
 *                 username:
 *                   type: string
 *                   default: mintie_2022
 *                 name:
 *                   type: string
 *                   default: mintie
 *     responses:
 *       200:
 *         description: New User Added successfully
 *       500:
 *         description: Failed to add a user
 */

// CHECKED
router.route('/add').post(async (req, res) => {
  
  try{
    
  const name = req.body.name;
   
  const categoryId = Str.random(8);

  
  console.log("-------Received a new Category Add Request------");
  let unique = true;
  let not_unique = '';
  let user_emailcheck = await category.findOne({ name: name });

  if (user_emailcheck) {
    unique = false;
    not_unique = 'Name';
  }
   
  let user_idcheck = await category.findOne({ categoryId: categoryId });
  if (user_idcheck) {
    unique = false;
    not_unique = 'ID';
  }

   if(unique){
    try {  
      console.log("Checking...");
      const newCategory = new category({
        categoryId: categoryId,
        name: name, 
      });
       
      newCategory
        .save()
        .then((response) => {
          
          let loginData = {
            category: newCategory,
            categoryId: newCategory._id,
             
          };

          console.log("Category Added",loginData);
          res.json(loginData);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json('Error: ' + err);
        });
    } catch (err) {
      res.send(err);
    } }
    else{
      res.status(400).json('Error:'+ not_unique+" Not Unique");
    }

}catch (err) {
  console.log(err);
  res.send(err);
}
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  username:
 *                     type: string
 *                     default: mintie
 *                  password:
 *                      type: string
 *                      default: mintie@123
 *
 *     responses:
 *       200:
 *         description: Login successful
 *       500:
 *         description: Invalid Login
 */

// Checked
router.route('/login').post(async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user_username = await User.findOne({ username: username });
    if (user_username) {
      const isMatch = await bcrypt.compare(
        password,
        user_username.password,
      );
      if (isMatch) {
        const data = {
          user_id: user_username._id,
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        let loginData = {
          user: user_username,
          jwtToken: authtoken,
        };

        res.send(loginData);
      } else {
        res.send('invalidpassword');
      }
    } else {
      res.send(false);
    }
  } catch (error) {
    res.status(400).send('Invalid Login');
  }
});

/**
 * @swagger
 * /user/reset_password:
 *   post:
 *     summary: User password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  email:
 *                    type: string
 *                    default: youremail@gmail.com
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       500:
 *         description: Cannot change password
 */
// Checked
router.route('/reset_password').post(async (req, res) => {
  try {
    const email = req.body.email;

    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
      }
      const token = buffer.toString('hex');

      const user = await User.findOne({ email: email });
      if (!user) {
        return res
          .status(422)
          .json({ error: 'User dont exists with that email' });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      user.save().then((result) => {
        transporter.sendMail({
          to: user.email,
          from: process.env.SERVICE_EMAIL,
          subject: 'password reset',
          html: `
                <p>You requested for password reset</p>
                <h5>click in this <a href="${process.env.SITE_URL}/reset/${token}">link</a> to reset password</h5>
                `,
        });
        res.json({ message: 'check your email' });
      });
    });
  } catch (error) {
    res.status(400).send('Invalid Login');
  }
});

/**
 * @swagger
 * /user/new_password:
 *   post:
 *     summary: New user password setup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  newPassword:
 *                    type: string
 *                    default: XYZ@123
 *                  sentToken:
 *                    type: string
 *                    default: dgsfaiyelgfsd2345fdsav234
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       500:
 *         description: Cannot change password
 */

// Checked
router.route('/new_password').post(async (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token; 
  const user = await User.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  });
  if (!user) {
    return res
      .status(422)
      .json({ error: 'Try again session expired' });
  }
  bcrypt
    .hash(newPassword, 10)
    .then((hashedpassword) => {
      user.password = hashedpassword;
      user.resetToken = undefined;
      user.expireToken = undefined;
      user.save().then((saveduser) => {
        res.json({ message: 'password updated success' });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

/**
 * @swagger
 * /user/send_verify_email:
 *   post:
 *     summary: Send Verification email to new logged in user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  email:
 *                     type: string
 *                     default: youremail@gmail.com
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       500:
 *         description: Cannot send Email
 */
// CHECKED MIDDLEWARE
router
  .route('/send_verify_email')
  .post(userMiddleware, async (req, res) => {
    const email = req.body.email;
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
      }
      const token = buffer.toString('hex');

      const user = await User.findOne({ _id: req.user_id });
      if (!user) {
        return res
          .status(422)
          .json({ error: 'User dont exists with that email' });
      }

      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;

      user
        .save()
        .then(() => {
          transporter.sendMail({
            to: email,
            from: process.env.SERVICE_EMAIL,
            subject: 'Verfiy your Dbeats Account',
            html: `
              <p>Please Verify your account.</p>
              <h5>Click on this <a href="${process.env.SITE_URL}/verifyemail/${token}">link</a> to verify account</h5>
              `,
          });
          res.json(user);
        })
        .catch((err) => {
          res.status(400).json('Error: ' + err);
        });
    });
  });

/**
 * @swagger
 * /user/send_feedback:
 *   post:
 *     summary: Receive User feedback
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  feedback:
 *                     type: string
 *                     default: My personal feedback
 *                  email:
 *                     type: string
 *                     default: youremail
 *     responses:
 *       200:
 *         description: Feedback received
 *       500:
 *         description: Cannot receive feedback
 */

//CHECKED MIDDLEWARE
router
  .route('/send_feedback')
  .post(userMiddleware, async (req, res) => {
    try {
      const feedback = req.body.feedback;
      const email = req.body.email;
      console.log(feedback);
      transporter.sendMail({
        to: process.env.SERVICE_EMAIL,
        from: process.env.SERVICE_EMAIL,
        subject: 'User Feedback',
        html: `
            <p>${feedback}</p>
            <p>From : ${email}</p>
            `,
      });
      res.send(feedbackData);
    } catch (err) {
      res.send(err);
    }
  });

/**
 * @swagger
 * /user/verify_email:
 *   post:
 *     summary: Eamil verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  sentToken:
 *                    type: string
 *                    default: daschgjkfdsa732i6fvydew76
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       500:
 *         description: Cannot verify email
 */

router.route('/verify_email').post(async (req, res) => {
  const sentToken = req.body.token;

  const user = await User.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(422)
      .json({ error: 'Try again session expired' });
  }

  try {
    user.is_mail_verified = true;
    user.save().then(() => {
      res.json({ message: 'success' });
    });
  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /user/send_wallet_reset:
 *   post:
 *     summary: Send wallet reset email to user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  email:
 *                     type: string
 *                     default: youremail@gmail.com
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       500:
 *         description: Cannot send Email
 */

router.route('/send_wallet_reset').post(async (req, res) => {
  const email = req.body.email;
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString('hex');

    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(422)
        .json({ error: 'User dont exists with that email' });
    }

    user.resetToken = token;
    user.expireToken = Date.now() + 3600000;

    user
      .save()
      .then(() => {
        transporter.sendMail({
          to: email,
          from: process.env.SERVICE_EMAIL,
          subject: 'Reset your Dbeats Wallet ID',
          html: `
              <p>You requested for wallet reset.</p>
              <h5>Click on this <a href="${process.env.SITE_URL}/resetwallet/${token}">link</a> to verify account</h5>
              `,
        });
        res.json(user);
      })
      .catch((err) => {
        res.status(400).json('Error: ' + err);
      });
  });
});

/**
 * @swagger
 * /user/new_wallet:
 *   post:
 *     summary: Switch wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  newwallet:
 *                    type: string
 *                    default: your new address
 *                  sentToken:
 *                    type: string
 *                    default: adsfgASYITEWR78634JHVKFDS
 *     responses:
 *       200:
 *         description: Wallet changed successfully
 *       500:
 *         description: Cannot change wallet
 */

router.route('/new_wallet').post(async (req, res) => {
  const newwallet = req.body.wallet;
  const sentToken = req.body.token;

  const user = await User.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  });
  if (!user) {
    return res
      .status(422)
      .json({ error: 'Try again session expired' });
  }
  try {
    user.wallet_id = newwallet;
    user.resetToken = undefined;
    user.expireToken = undefined;
    user.save().then((saveduser) => {
      res.json({ message: 'wallet updated success' });
    });
  } catch (err) {
    console.log(err);
  }
});

//CHECKED MIDDLEWARE
router
  .route('/add_multistream_platform')
  .post(userMiddleware, async (req, res) => {
    try {
      const data = {
        selected: 0,
        platform: req.body.platform,
      };
      const username = req.body.username;
      User.findOneAndUpdate(
        { _id: req.user_id },
        { $push: { multistream_platform: data } },
        function (error, success) {
          if (error) {
            res.send(error);
          } else {
            res.send('success');
          }
        },
      );
    } catch (err) {
      res.send('multistream_error');
    }
  });

/**
 * @swagger
 * /user/coverimage:
 *   post:
 *     summary: Alter profile cover image
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  userId:
 *                     type: string
 *                     default: mintie_2022
 *                  coverImage:
 *                     type: string
 *                     default: https://ipfs.io/ipfs/bafybj5ebemvdx37di7eifs2u454wbvk2mvzhidqwiu/milesmorales.webp
 *     responses:
 *       200:
 *         description: Add/Change successfull
 *       500:
 *         description: Cannot Add/Change cover image
 */

//CHECKED MIDDLEWARE
router.route('/coverimage').post(userMiddleware, async (req, res) => {
  const userId = req.body.username;
  const coverImage = req.files.coverImage;

  var currentTimeInSeconds = Math.floor(Date.now() / 1000);

  const time = currentTimeInSeconds;

  const coverImagePath = coverImage.name;

  var coverImageHashLink = null;

  coverImage.mv(coverImagePath, async (err) => {
    try {
      const uploadHash = req.body.imageHash;

      const imageHash = req.files.coverImage.name;

      coverImageHashLink =
        'https://ipfs.io/ipfs/' + uploadHash + '/' + imageHash;

      fs.unlink(coverImagePath, (err) => {
        if (err) console.log(err);
      });

      if (coverImageHashLink != null) {
        User.findOneAndUpdate(
          { _id: req.user_id },
          { $set: { cover_image: coverImageHashLink } },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
        return res.send(coverImageHashLink);
      } else {
        return res.render('upload', { error: 'Error!' });
      }
    } catch (error) {
      console.log(error);
    }
  });
});

/**
 * @swagger
 * /user/profileimage:
 *   post:
 *     summary: Alter profile image
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  userId:
 *                     type: string
 *                     default: mintie_2022
 *                  coverImage:
 *                     type: string
 *                     default: https://ipfs.io/ipfs/bafybj5ebemvdx37di7eifs2u454wbvk2mvzhidqwiu/milesmorales.webp
 *     responses:
 *       200:
 *         description: Add/Change successfull
 *       500:
 *         description: Cannot Add/Change profile image
 */

//CHECKED MIDDLEWARE
router
  .route('/profileimage')
  .post(userMiddleware, async (req, res) => {
    const userId = req.body.username;
    const profileImage = req.files.profileImage;

    var currentTimeInSeconds = Math.floor(Date.now() / 1000);

    const time = currentTimeInSeconds;

    const profileImagePath = profileImage.name;

    var profileImageHashLink = null;

    profileImage.mv(profileImagePath, async (err) => {
      try {
        const uploadHash = req.body.imageHash;

        const imageHash = req.files.profileImage.name;

        profileImageHashLink =
          'https://ipfs.io/ipfs/' + uploadHash + '/' + imageHash;

        fs.unlink(profileImagePath, (err) => {
          if (err) console.log(err);
        });

        if (profileImageHashLink != null) {
          User.findOneAndUpdate(
            { _id: req.user_id },
            { $set: { profile_image: profileImageHashLink } },
            function (error, success) {
              if (error) {
                res.send(error);
              }
            },
          );
          const temp = await Feed.updateMany(
            { username: userId },
            { $set: { profile_image: profileImageHashLink } },
          );
          return res.send(profileImageHashLink);
        } else {
          return res.render('upload', { error: 'Error!' });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    });
  });

/**
 * @swagger
 * /user/{username}:
 *   get:
 *     summary: Get the user by username
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *           default: mintie_2022
 *         required: true
 *         description: The users username
 *     responses:
 *       200:
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *         description: The user was found
 *       404:
 *         description: The user was not found
 */
// CHECKED
router.route('/:username').get(async (req, res) => {
  try {
    const getuserData = req.params.username;

    const userData = await User.findOne({ username: getuserData });
    res.send(userData);
  } catch (err) {
    res.send('Try Again');
  }
});

/**
 * @swagger
 * /user/getuser_by_id/{streamID}:
 *   get:
 *     summary: Get the user by username
 *     parameters:
 *       - in: path
 *         name: streamID
 *         schema:
 *           type: string
 *         required: true
 *         description: The users username
 *     responses:
 *       200:
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *         description: The user was found
 *       404:
 *         description: The user was not found
 */

// CHECKED
router.route('/getuser_by_id/:streamID').get(async (req, res) => {
  try {
    const stream_id = req.params.streamID;

    const userData = await User.findOne({
      'livepeer_data.id': stream_id,
    });

    res.send(userData);
  } catch (err) {
    res.send('Try Again');
  }
});

/**
 * @swagger
 * /user/getuser_by_wallet:
 *   post:
 *     summary: Find a user by wallet address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  walletId:
 *                     type: string
 *                     default: your wallet address
 *                  name:
 *                     type: string
 *                     default: your name
 *                  email:
 *                     type: string
 *                     default: yourexample@gmail.com
 *     responses:
 *       200:
 *         description: Add/Change successfull
 *       500:
 *         description: Cannot Add/Change profile image
 */

// CHECKED
router.route('/getuser_by_wallet/').post(async (req, res) => {
  try {
    const wallet_id = req.body.walletId;
    const name = req.body.name;
    const email = req.body.email;
    const profileImage = req.body.profileImage;

    const referrer = req.body.referrer;

    const userData = await User.findOne({ wallet_id: wallet_id });
    if (userData) {
      const data = {
        user_id: userData._id,
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      let loginData = {
        user: userData,
        jwtToken: authtoken,
      };
      res.send(loginData);
    } else if (!userData && req.body.fetchData) {
      return 'No user found';
    } else {
      if (email != '' && email != null && email != undefined) {
        let userName = email.substring(0, email.lastIndexOf('@'));
        console.log(userName);

        const userId = Str.random(8);

        let unique = true;
        let not_unique = '';
        let user_emailcheck = await User.findOne({
          email: email,
        });

        if (user_emailcheck) {
          unique = false;
          not_unique = 'Email';
        }
        let user_usernamecheck = await User.findOne({
          username: userName,
        });
        if (user_usernamecheck) {
          // unique = false;
          // not_unique = 'Username';
          userName = userName + userId;
        }

        let user_idcheck = await User.findOne({ id: userId });
        if (user_idcheck) {
          unique = false;
          not_unique = 'ID';
        }

        if (unique) {
          try {
            const livepeerKey = process.env.LIVEPEER_KEY;
            const AuthStr = 'Bearer '.concat(livepeerKey);

            let streamData = {
              name: `${name}`,
              profiles: [
                {
                  name: '720p',
                  bitrate: 2000000,
                  fps: 30,
                  width: 1280,
                  height: 720,
                },
                {
                  name: '480p',
                  bitrate: 1000000,
                  fps: 30,
                  width: 854,
                  height: 480,
                },
                {
                  name: '360p',
                  bitrate: 500000,
                  fps: 30,
                  width: 640,
                  height: 360,
                },
              ],
            };

            const value = await axios({
              method: 'post',
              url: 'https://livepeer.com/api/stream',
              data: streamData,
              headers: {
                'content-type': 'application/json',
                Authorization: AuthStr,
              },
            });
            console.log(value.data);

            const newUser = new User({
              username: userName,
              id: userId,
              name: name,
              email: email,
              wallet_id: wallet_id,
              livepeer_data: value.data,
              profile_image: profileImage,
              refer: {
                referrer_id: referrer,
                clicks: 0,
                verified_referrals: 0,
                unverified_referrals: 0,
              },
            });

            console.log(newUser);

            newUser
              .save()
              .then(async () => {
                const data = {
                  user_id: newUser._id,
                };
                const authtoken = jwt.sign(data, JWT_SECRET);
                let loginData = {
                  user: newUser,
                  jwtToken: authtoken,
                };
                console.log(loginData);

                /////
                User.findOneAndUpdate(
                  { username: referrer },
                  { $inc: { 'refer.unverified_referrals': 1 } },
                  function (error, success) {
                    if (error) {
                      console.log(error);
                      res.send(error);
                    } else if (success) {
                      console.log('referral click incremented');
                      res.json(loginData);
                    }
                  },
                  { upsert: true },
                );

                /////
                const userData2 = await User.findOne({ wallet_id: wallet_id });
                if (userData2) {
                  const data = {
                    user_id: userData2._id,
                  };
                  const authtoken = jwt.sign(data, JWT_SECRET);
                  let loginData = {
                    user: userData2,
                    jwtToken: authtoken,
                  };
                  res.send(loginData);
                }
              })
              .catch((err) => {
                console.log(err);
                res.status(400).json('Error: ' + err);
              });
          } catch (err) {
            console.log(err);
            res.send(err);
          }
        } else {
          res.send(not_unique);
        }
      } else {
        res.status(404).send('No user found');
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});

// /**
//  * @swagger
//  * /user/referred-by/{username}:
//  *   post:
//  *     summary: Referred by username
//  *     parameters:
//  *       - in: path
//  *         name: username
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: username
//  *     requestBody:
//  *       required: true
//  *     responses:
//  *       200:
//  *         description: The user was found
//  *       404:
//  *         description: The user was not found
//  */

router.route('/referred-by/:username').post((req, res) => {
  User.findOneAndUpdate(
    { username: req.params.username },
    { $inc: { 'refer.clicks': 1 } },
    function (error, success) {
      if (error) {
        console.log(error);
        res.send(error);
      } else if (success) {
        console.log(
          'You have been Referred by ' + req.params.username,
        );
        res.json('You have been Referred by ' + req.params.username);
      }
    },
    { upsert: true },
  );
});

/**
 * @swagger
 * /user/update:
 *   post:
 *     summary: Update profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  username:
 *                     type: string
 *                     default: mintie_2022
 *                  new_name:
 *                     type: string
 *                     default: mint
 *                  new_email:
 *                     type: string
 *                     default: new_email@gmail.com
 *     responses:
 *       200:
 *         description: Update successfull
 *       500:
 *         description: Update unsuccessfull
 */

//CHECKED MIDDLEWARE
router.route('/update').post(userMiddleware, async (req, res) => {
  const username = req.body.username;
  const new_name = req.body.name;
  const new_email = req.body.email;
  try {
    const user = await User.findOne({ _id: req.user_id });

    if (user) {
      if (user.email == new_email) {
        user.name = new_name;
        const temp = await Feed.updateMany(
          { username: user.username },
          { name: new_name },
        );
        user.save().then(() => {
          res.json({ message: 'success' });
        });
      } else {
        let user_emailcheck = await User.findOne({
          email: new_email,
        });
        if (!user_emailcheck) {
          user.is_mail_verified = false;
          user.email = new_email;
          user.name = new_name;
          const temp = await Feed.updateMany(
            { username: user.username },
            { name: new_name },
          );
          user.save().then(() => {
            res.json({ message: 'success' });
          });
        }
      }
    } else {
      res.send('Invalid');
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /user/update-superfan:
 *   post:
 *     summary: Superfan data update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              properties:
 *                  username:
 *                     type: string
 *                     default: mintie_2022
 *                  plandata:
 *                     type: object
 *     responses:
 *       200:
 *         description: Update successfull
 *       500:
 *         description: Update unsuccessfull
 */

//CHECKED MIDDLEWARE
router
  .route('/update-superfan')
  .post(userMiddleware, async (req, res) => {
    const username = req.body.username;
    const planData = req.body.planData;
    console.log(username, planData);
    try {
      User.findOneAndUpdate(
        { _id: req.user_id },
        { $set: { superfan_data: planData } },
        { upsert: true },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );

      res.send('success');
    } catch (err) {
      console.log(err);
    }
  });

module.exports = router;
