const router = require('express').Router();
var mongoose = require('mongoose');
const userMiddleware = require('../../helper/userMiddleware');
 const { MongoClient } = require('mongodb');
let User = require('../../models/user.model');
 var ObjectId = require('mongoose').Types.ObjectId;

const uri = process.env.ATLAS_URI;
const client = new MongoClient("mongodb://root:supersapiens@cluster0-shard-00-00.p80zj.mongodb.net:27017,cluster0-shard-00-01.p80zj.mongodb.net:27017,cluster0-shard-00-02.p80zj.mongodb.net:27017/lawbud?replicaSet=atlas-4259e6-shard-0&ssl=true&authSource=admin");
client.connect();
const dbName = 'lawbud';

/**
 * @swagger
 * components:
 *    schemas:
 *       User:
 *         type: object
 *         properties:
 *              id:
 *                type: string
 *              name:
 *                type: string
 *              username:
 *                type: string
 *              email:
 *                type: string
 *              jwt_token:
 *                type: string
 *              wallet_id:
 *                type: string
 *              password:
 *                type: string
 *              cover_image:
 *                type: string
 *              profile_image:
 *                type: string
 *              livepeer_data:
 *                type: object
 *              superfan_data:
 *                type: object
 *              tracks:
 *                type: array
 *              videos:
 *                type: array
 *              multistream_platform:
 *                type: array
 *              pinned:
 *                type: array
 *              posts:
 *                type: array
 *              notification:
 *                type: array
 *              oldnotification:
 *                type: array
 *              your_reactions:
 *                type: array
 *              my_playlists:
 *                type: array
 *              reports:
 *                type: array
 *              refer:
 *                type: object
 *              thumbnail:
 *                type: string
 *              album_count:
 *                type: integer
 */

/**
 * @swagger
 * /user:
 *     get:
 *       summary: Get all users
 *       responses:
 *         '200':
 *           description: A list of users.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /user/follow:
 *   post:
 *     summary: Follow a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  following:
 *                      type: string
 *                  user:
 *                      type: string
 *     responses:
 *       200:
 *         description: Follow successful
 *       500:
 *         description: Some server error
 */

// CHECKED MIDDLEWARE
router.route('/follow').post(userMiddleware, async (req, res) => {
  try {
    const following = req.body.following;
    // const follower = req.body.follower;
    const user = await User.findById(req.user_id);

    //console.log(following);
    //console.log(follower);

    const announcementData = {
      announcement: `${user.username} started following you`,
      post_image: user.profile_image ? user.profile_image : null,
      post_video: null,
      link: `/homescreen/profile/${user.username}`,
      time: Date.now() / 1000,
      username: user.username,
      linkpreview_data: null,
    };

    User.findOneAndUpdate(
      { username: following },
      {
        $push: {
          follower_count: user.username,
          notification: announcementData,
        },
      },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );

    User.findOneAndUpdate(
      { username: user.username },
      { $push: { followee_count: following } },
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

/**
 * @swagger
 * /user/delete_user/{id}:
 *  delete:
 *      description: Delete a user
 *      parameters:
 *        - in: path
 *          name: id
 *          description: Id of user to be deleted
 *          schema:
 *              type: string
 *              default: dsV7f
 *      responses:
 *          200:
 *              description: User deleted successfully
 */

router.route('/delete_user/:id').delete(async (req, res) => {
  try {
    const id = req.params.id;
    User.findOneAndDelete({ id: id }, function (error, success) {
      if (error) {
        res.send(error);
      }
      res.status(201).send('success');
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /user/unfollow:
 *   post:
 *     summary: Unfollow a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  following:
 *                      type: string
 *                  user:
 *                      type: string
 *     responses:
 *       200:
 *         description: Unfollow successful
 *       500:
 *         description: Some server error
 */

// CHECKED MIDDLEWARE
router.route('/unfollow').post(userMiddleware, async (req, res) => {
  try {
    const following = req.body.following;
    // const follower = req.body.follower;
    const user = await User.findById(req.user_id);
    // console.log(following, follower);

    const announcementData = {
      announcement: `${user.username} unfollowed you`,
      post_image: user.profile_image ? user.profile_image : null,
      post_video: null,
      link: `/homescreen/profile/${user.username}`,
      time: Date.now() / 1000,
      username: user.username,
      linkpreview_data: null,
    };

    User.findOneAndUpdate(
      { username: following },
      { $pull: { follower_count: user.username } },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );

    User.findOneAndUpdate(
      { username: following },
      { $push: { notification: announcementData } },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );

    User.findOneAndUpdate(
      { username: user.username },
      { $pull: { followee_count: following } },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );
    User.findOneAndUpdate(
      { username: user.username },
      { $pull: { pinned: following } },
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

router.route('/send_gems').post(userMiddleware, async (req, res) => {
  try {
    const value = req.body.coins;
    const receivedBy = req.body.receivedBy;
    const prevBalance = req.body.prevBalance;
    const update = req.body.update;
    const tasksPerformed = req.body.tasksPerformed;
    const user = await User.findById(req.user_id);

    if (req.body.type === 'social') {
      if (!prevBalance) {
        let data = {
          balance: value,
          history: [
            {
              receivedBy: receivedBy,
              time: Date.now() / 1000,
            },
          ],
          tasksPerformed: {
            followedTwitter:
              update == 'followedTwitter' ? true : false,
            followedInstagram:
              update == 'followedInstagram' ? true : false,
            followedLinkedin:
              update == 'followedLinkedin' ? true : false,
            followedDiscord:
              update == 'followedDiscord' ? true : false,
            firstPost: false,
            followFive: false,
          },
        };

        User.findOneAndUpdate(
          { username: user.username },
          {
            $set: { coins: data },
          },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
        res.send('success');
      } else {
        let total = prevBalance ? prevBalance + value : value;
        let data = {
          receivedBy: receivedBy,
          time: Date.now() / 1000,
        };
        switch (update) {
          case 'followedTwitter':
            tasksPerformed.followedTwitter = true;
            break;
          case 'followedInstagram':
            tasksPerformed.followedInstagram = true;
            break;
          case 'followedLinkedin':
            tasksPerformed.followedLinkedin = true;
            break;
          case 'followedDiscord':
            tasksPerformed.followedDiscord = true;
            break;
        }

        User.findOneAndUpdate(
          { username: user.username },
          {
            $set: { 'coins.balance': total },
          },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );

        User.findOneAndUpdate(
          { username: user.username },
          {
            $push: { 'coins.history': data },
          },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
        User.findOneAndUpdate(
          { username: user.username },
          {
            $set: { 'coins.tasksPerformed': tasksPerformed },
          },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
        res.send('success');
      }
    }

    if (req.body.type === 'platformTasks') {
      if (!prevBalance) {
        let data = {
          balance: value,
          history: [
            {
              receivedBy: receivedBy,
              time: Date.now() / 1000,
            },
          ],
          tasksPerformed: {
            followedTwitter: false,
            followedInstagram: false,
            followedLinkedin: false,
            followedDiscord: false,
            firstPost: update == 'firstPost' ? true : false,
            followFive: update == 'follow' ? true : false,
          },
        };

        User.findOneAndUpdate(
          { username: user.username },
          {
            $set: { coins: data },
          },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );

        res.send('success');
      } else {
        let total = prevBalance ? prevBalance + value : value;
        historyData = {
          receivedBy: receivedBy,
          time: Date.now() / 1000,
        };
        switch (update) {
          case 'follow':
            tasksPerformed.followFive = true;
            break;
          case 'firstPost':
            tasksPerformed.firstPost = true;
            break;
        }
        User.findOneAndUpdate(
          { username: user.username },
          {
            $set: { 'coins.balance': total },
          },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );

        User.findOneAndUpdate(
          { username: user.username },
          {
            $push: { 'coins.history': historyData },
          },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
        User.findOneAndUpdate(
          { username: user.username },
          {
            $set: { 'coins.tasksPerformed': tasksPerformed },
          },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
        res.send('success');
      }
    }
  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /user/getuser_coins/{id}:
 *  get:
 *      description: Get Coin Balance of a user
 *      parameters:
 *        - in: path
 *          name: id
 *          description: Add user id
 *          schema:
 *              type: string
 *              default: hfe21j
 *      responses:
 *          200:
 *              description: Success
 */

router.route('/getuser_coins/:id').get(async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOne({ id: id });

    if (user.coins) {
      let coins = user.coins;
      res.json({ coins });
    } else {
      res.send('No coins earned yet');
    }
  } catch (err) {
    res.send('Try Again');
  }
});

router.route('/get_dev_gems/:username').get(async (req, res) => {
  try {
    const id = req.params.username;

    const user = await User.findOne({ username: id });

    User.findOneAndUpdate(
      { username: id },
      {
        $set: { 'gems.balance': user.gems.balance + 50 },
      },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );
    res.send('success');
  } catch (err) {
    res.send('Try Again');
  }
});

/**
 * @swagger
 * /user/getuser_gems/{id}:
 *  get:
 *      description: Get Gem Details of a user
 *      parameters:
 *        - in: path
 *          name: id
 *          description: Add user id
 *          schema:
 *              type: string
 *              default: hfe21j
 *      responses:
 *          200:
 *              description: Success
 */
router.route('/getuser_gems/:id').get(async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOne({ id: id });

    if (user.gems) {
      let gems = user.gems;
      res.json({ gems });
    } else {
      res.send('No gems earned yet');
    }
  } catch (err) {
    res.send('Try Again');
  }
});

/**
 * @swagger
 * /user/convert_treasury:
 *   post:
 *     summary: Conert Coins to gems (In range of 100)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  value:
 *                      type: integer
 *     responses:
 *       200:
 *         description: Coins converted to gems successfully
 *       500:
 *         description: Some server error
 */

router
  .route('/convert_treasury')
  .post(userMiddleware, async (req, res) => {
    try {
      const value = req.body.value;
      // const id = req.body.id;
      const user = await User.findById(req.user_id);
      console.log(user.username);

      User.findOneAndUpdate(
        { id: user.id },
        {
          $set: { 'gems.balance': user.gems.balance + value / 10 },
        },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );

      User.findOneAndUpdate(
        { id: user.id },
        {
          $set: { 'coins.balance': user.coins.balance - value },
        },
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

/**
 * @swagger
 * /user/nft-notification:
 *   post:
 *     summary: Notification on nft creation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  username:
 *                      type: string
 *                      default: mintie_2022
 *                  profile_image:
 *                      type: string
 *                      default: your ipfs file link here
 *     responses:
 *       200:
 *         description: NFT created successfully
 *       500:
 *         description: Some server error
 */

//CHECKED MIDDLEWARE
router
  .route('/nft-notification')
  .post(userMiddleware, async (req, res) => {
    try {
      const username = req.body.username;
      const profile_image = req.body.nft_image;
      const user = await User.findById(req.user_id);
      // console.log(following, follower);

      const announcementData = {
        announcement: `Check out ${username}'s new NFT`,
        post_image: profile_image ? profile_image : null,
        post_video: null,
        link: `/hoemscreen/profile/${user.username}/store`,
        time: Date.now() / 1000,
        username: username,
        linkpreview_data: null,
      };

      user.follower_count.forEach(function (id) {
        User.updateOne(
          { username: id },
          { $push: { notification: announcementData } },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
      });

      res.send('success');
    } catch (err) {
      console.log(err);
    }
  });

/**
 * @swagger
 * /user/superfan:
 *   post:
 *     summary: Subscribe to be a users superfan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  txnHash:
 *                      type: string
 *                  superfanof:
 *                      type: string
 *     responses:
 *       200:
 *         description: Subscription successful
 *       500:
 *         description: Some server error
 */

router.route('/superfan').post(userMiddleware, async (req, res) => {
  try {
    console.log('hello');
    const txnHash = req.body.txnHash;
    const superfanof = req.body.superfanof;
    // const follower = req.body.follower;
    const user = await User.findById(req.user_id);
    const superfanOfUser = await User.find({ username: superfanof });
    var superfanData = {
      username: superfanof,
      plan: req.body.plan,
      txnHash: req.body.txnHash,
      boughtOn: Date.now() / 1000,
    };
    //console.log(following);
    //console.log(follower);
    const announcementData = {
      announcement: `${user.username} subscribed to your ${req.body.plan} superfan plan`,
      post_image: user.profile_image ? user.profile_image : null,
      post_video: null,
      link: `/hoemscreen/profile/${user.username}`,
      time: Date.now() / 1000,
      username: user.username,
      linkpreview_data: null,
    };

    let count = -1;

    if (user.superfan_of) {
      user.superfan_of.forEach((val, i) => {
        if (val.username === superfanof) {
          count = i;
        }
      });
    }
    if (count != -1) {
      let data = user.superfan_of;
      data[count] = superfanData;
      User.findOneAndUpdate(
        { username: user.username },
        {
          $set: { superfan_of: data },
        },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
    } else {
      User.findOneAndUpdate(
        { username: user.username },
        {
          $push: { superfan_of: superfanData },
        },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
    }

    superfanData = {
      username: user.username,
      plan: req.body.plan,
      txnHash: req.body.txnHash,
      boughtOn: Date.now() / 1000,
    };

    let Ofcount = -1;
    console.log(superfanOfUser[0].superfan_to);

    if (superfanOfUser[0].superfan_to) {
      superfanOfUser[0].superfan_to.forEach((val, i) => {
        if (val.username == user.username) {
          Ofcount = i;
        }
      });
    }
    console.log(Ofcount);
    if (Ofcount != -1) {
      let data = superfanOfUser[0].superfan_to;
      data[Ofcount] = superfanData;
      User.findOneAndUpdate(
        { username: superfanof },
        {
          $set: { superfan_to: data },
        },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );

      User.findOneAndUpdate(
        { username: superfanof },
        {
          $push: { notification: announcementData },
        },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
    } else {
      User.findOneAndUpdate(
        { username: superfanof },
        {
          $push: { superfan_to: superfanData },
          notification: announcementData,
        },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
    }
    res.send('success');
  } catch (err) {
    console.log(err);
  }
});

// CHECKED
router.route('/:username/favorites').get(async (req, res) => {
  try {
    const getuserData = req.params.username;

    const userData = await User.findOne(
      { _id: req.user_id },
      { favorite_tracks: 1, _id: 0 },
    );

    res.json(userData.favorite_tracks);
  } catch (err) {
    res.send('Try Again');
  }
});
// CHECKED
router.route('/favorite').post(userMiddleware, async (req, res) => {
  try {
    const uname = req.body.username;
    const track = req.body.track_id;
    User.findOneAndUpdate(
      { _id: req.user_id },
      { $push: { favorite_tracks: track } },
      function (error, success) {
        if (error) {
          console.log(error);
          res.send(error);
        } else {
          res.send('success');
        }
      },
    );
  } catch (err) {
    console.log(err);
  }
});
// CHECKED
router.route('/unfavorite').post(userMiddleware, async (req, res) => {
  try {
    const uname = req.body.username;
    const track = req.body.track_id;
    User.findOneAndUpdate(
      { _id: req.user_id },
      { $pull: { favorite_tracks: track } },
      function (error, success) {
        if (error) {
          res.send(error);
        } else {
          res.send('success');
        }
      },
    );
  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /user/reactions:
 *   post:
 *     summary: Video reaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  videoUsername:
 *                      type: string
 *                      default: mnintie_2022
 *                  reactUsername:
 *                      type: string
 *                      default: orion
 *                  videoreaction:
 *                      type: string
 *                      default: like
 *                  videostreamid:
 *                      type: string
 *                      default: mintie_2022
 *                  videoindex:
 *                      type: string
 *                      default: xhgdf
 *                  videolink:
 *                      type: string
 *                  reactUser:
 *                      type: string
 *                      default: mintie_2022
 *     responses:
 *       200:
 *         description: Follow successful
 *       500:
 *         description: Some server error
 */
// CHECKED MIDDLEWARE
router.route('/reactions').post(userMiddleware, async (req, res) => {
  try {
    const videoUsername = req.body.videousername;
    const reactUsername = req.body.reactusername;
    const videoreaction = req.body.reaction;
    const videostreamid = req.body.videostreamid;
    const videoindex = req.body.videoindex;
    const videolink = req.body.videolink;
    const videoname = `${videostreamid}/${videoindex}`;
    const user = await User.findOne({ username: videoUsername });
    const reactUser = await User.findOne({ _id: req.user_id });
    let count = -1;
    for (let i = 0; i < user.videos.length; i++) {
      if (user.videos[i].link === videolink) {
        count = i;
        break;
      }
    }

    let yourdata = {
      reaction: videoreaction,
      link: videoname,
      video: user.videos[videoindex],
    };

    if (count != -1) {
      let data = user.videos;
      if (!data[count].reaction) {
        data[count].reaction = {
          like: [],
          // dislike: [],
          // angry: [],
          // happy: [],
        };
      }

      if (videoreaction === 'like')
        data[count].reaction.like.push(reactUser.username);
      // else if (videoreaction === 'dislike')
      //   data[count].reaction.dislike.push(reactUser.username);
      // else if (videoreaction === 'angry')
      //   data[count].reaction.angry.push(reactUser.username);
      // else if (videoreaction === 'happy')
      //   data[count].reaction.happy.push(reactUser.username);

      User.findOneAndUpdate(
        { username: videoUsername },
        { $set: { videos: data } },
        { upsert: true },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
      User.findOneAndUpdate(
        { username: reactUser.username },
        { $push: { your_reactions: yourdata } },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
    }
    res.send('success');
  } catch (err) {
    console.log(err);
  }
});

// CHECKED
router.route('/getreactions').post(async (req, res) => {
  try {
    const videoUsername = req.body.videousername;
    const videolink = req.body.videolink;
    const user = await User.findOne({ username: videoUsername });

    let count = -1;
    for (let i = 0; i < user.videos.length; i++) {
      if (user.videos[i].link === videolink) {
        res.send(user.videos[i]);
      }
    }
  } catch (err) {
    console.log(err);
  }
});

// CHECKED
router.route('/getuserreaction').post(async (req, res) => {
  try {
    const videoUsername = req.body.videousername;
    const reactUsername = req.body.username;
    const videoname = req.body.videoname;
    const videolink = req.body.videolink;
    const user = await User.findOne({ username: videoUsername });

    let count = -1;
    for (let i = 0; i < user.videos.length; i++) {
      if (user.videos[i].link === videolink) {
        count = i;
        break;
      }
    }

    if (count != -1) {
      let data = user.videos;
      if (!data[count].reaction) {
        data[count].reaction = {
          like: [],
          // dislike: [],
          // angry: [],
          // happy: [],
        };
      }

      if (data[count].reaction.like.indexOf(reactUsername) > -1) {
        res.send('like');
      }
      // else if (
      //   data[count].reaction.dislike.indexOf(reactUsername) > -1
      // ) {
      //   res.send('dislike');
      // } else if (
      //   data[count].reaction.angry.indexOf(reactUsername) > -1
      // ) {
      //   res.send('angry');
      // } else if (
      //   data[count].reaction.happy.indexOf(reactUsername) > -1
      // ) {
      //   res.send('happy');
      // }
      else {
        res.send(null);
      }
    }
  } catch (err) {
    console.log(err);
  }
});
// CHECKED MIDDLEWARE
router
  .route('/removeuserreaction')
  .post(userMiddleware, async (req, res) => {
    try {
      const videoUsername = req.body.videousername;
      const reactUsername = req.body.reactusername;
      const oldreaction = req.body.oldreaction;
      const newreaction = req.body.newreaction;
      const videostreamid = req.body.videostreamid;
      const videoindex = req.body.videoindex;
      const videoname = `${videostreamid}/${videoindex}`;
      const videolink = req.body.videolink;
      const user = await User.findOne({ username: videoUsername });
      const reactuser = await User.findOne({ _id: req.user_id });

      let count = -1;
      for (let i = 0; i < user.videos.length; i++) {
        if (user.videos[i].link === videolink) {
          count = i;
          break;
        }
      }

      if (count != -1) {
        let data = user.videos;
        if (oldreaction === newreaction) {
          if (oldreaction === 'like')
            data[count].reaction.like.pop(reactuser.username);
          // else if (oldreaction === 'dislike')
          //   data[count].reaction.dislike.pop(reactuser.username);
          // else if (oldreaction === 'angry')
          //   data[count].reaction.angry.pop(reactuser.username);
          // else if (oldreaction === 'happy')
          //   data[count].reaction.happy.pop(reactuser.username);
        } else {
          if (oldreaction === 'like')
            data[count].reaction.like.pop(reactuser.username);
          // else if (oldreaction === 'dislike')
          //   data[count].reaction.dislike.pop(reactuser.username);
          // else if (oldreaction === 'angry')
          //   data[count].reaction.angry.pop(reactuser.username);
          // else if (oldreaction === 'happy')
          //   data[count].reaction.happy.pop(reactuser.username);

          if (newreaction === 'like')
            data[count].reaction.like.push(reactuser.username);
          // else if (newreaction === 'dislike')
          //   data[count].reaction.dislike.push(reactuser.username);
          // else if (newreaction === 'angry')
          //   data[count].reaction.angry.push(reactuser.username);
          // else if (newreaction === 'happy')
          //   data[count].reaction.happy.push(reactuser.username);
        }

        User.findOneAndUpdate(
          { username: videoUsername },
          { $set: { videos: data } },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
      }

      let yourReactionData = {
        reaction: newreaction,
        link: videoname,
        video: user.videos[videoindex],
      };

      let yourcount = -1;
      for (let i = 0; i < reactuser.your_reactions.length; i++) {
        if (reactuser.your_reactions[i].link === videoname) {
          yourcount = i;
          break;
        }
      }
      if (yourcount != -1) {
        let yourdata = reactuser.your_reactions;
        yourdata.splice(yourcount, 1);
        if (oldreaction !== newreaction) {
          yourdata.push(yourReactionData);
        }
        User.findOneAndUpdate(
          { username: reactuser.username },
          { $set: { your_reactions: yourdata } },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
      }
      res.send('success');
    } catch (err) {
      console.log(err);
    }
  });

/**
 * @swagger
 * /user/pinned:
 *   post:
 *     summary: Pinning a user to side pannel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  username:
 *                      type: string
 *                      default: mintie_2022
 *                  pinnedUser:
 *                      type: string
 *                      default: orion
 *     responses:
 *       200:
 *         description: User pinned successfully
 *       500:
 *         description: Some server error
 */

// CHECKED MIDDLEWARE
router.route('/pinned').post(userMiddleware, async (req, res) => {
  try {
    const username = req.body.username;
    const pinnedUser = req.body.pinneduser;
    User.findOneAndUpdate(
      { _id: req.user_id },
      { $push: { pinned: pinnedUser } },
      function (error, success) {
        if (error) {
          res.send(error);
        } else {
          res.send('success');
        }
      },
    );
  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /user/unpin:
 *   post:
 *     summary: Unpinning a user from side pannel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  username:
 *                      type: string
 *                      default: mintie_2022
 *                  pinnedUser:
 *                      type: string
 *                      default: orion
 *     responses:
 *       200:
 *         description: User unpinned successfully
 *       500:
 *         description: Some server error
 */

// CHECKED MIDDLEWARE
router.route('/unpin').post(userMiddleware, async (req, res) => {
  try {
    const username = req.body.username;
    const pinnedUser = req.body.pinneduser;
    User.findOneAndUpdate(
      { _id: req.user_id },
      { $pull: { pinned: pinnedUser } },
      function (error, success) {
        if (error) {
          res.send(error);
        } else {
          res.send('success');
        }
      },
    );
  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /user/announcement:
 *   post:
 *     summary: Create a post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  username:
 *                      type: string
 *                      default: mintie_2022
 *                  announcement:
 *                      type: string
 *                      default: Your post here...
 *     responses:
 *       200:
 *         description: Post created successfully
 *       500:
 *         description: Some server error
 */

router.route('/seen_intro').post(userMiddleware, async (req, res) => {
  try {
    const seen = req.body.seen;
    console.log(req.user_id);
    User.findOneAndUpdate(
      { _id: req.user_id },
      { $set: { seenIntro: seen } },
      function (error, success) {
        if (error) {
          res.send(error);
        } else {
          res.send('success');
        }
      },
    );
  } catch (err) {
    console.log(err);
  }
});

// CHECKED MIDDLEWARE
router
  .route('/announcement')
  .post(userMiddleware, async (req, res) => {
    try {
      let tagged = req.body.tagged;
      const announcement = req.body.announcement;
      let linkData = {};
      if (req.body.previewData) {
        linkData = JSON.parse(req.body.previewData);
      }
      const tokenId = req.body.tokenId;
      const db = client.db(dbName);
      const collection = db.collection('feed');

      console.log(tokenId);

      let post_image = null;
      let post_video = null;

      if (req.files) {
        post_image = req.files.postImage;
        post_video = req.files.postVideo;
      }

      const link = req.body.eventlink;
      const uploadHash = req.body.announcementHash
        ? req.body.announcementHash
        : null;

      const user = await User.findOne({ _id: req.user_id });

      let postImg, postVid;

      if (post_video) {
        postVid =
          'https://ipfs.io/ipfs/' +
          uploadHash +
          '/' +
          post_video.name;
      }
      if (post_image) {
        postImg =
          'https://ipfs.io/ipfs/' +
          uploadHash +
          '/' +
          post_image.name;
      }
      const postId = makeid(7);
      const announcementData = {
        postId: postId,
        announcement: announcement,
        post_image: postImg ? postImg : null,
        post_video: postVid ? postVid : null,
        link: `/homescreen/profile/${user.username}/posts`,
        time: Math.floor(Date.now() / 1000),
        tokenId: tokenId,
        username: user.username,
        linkpreview_data: linkData,
      };

      const notificationAnnouncementData = {
        postId: postId,
        announcement: tokenId
          ? `${user.username} minted a new NFT`
          : `${user.username} uploaded a new photo`,
        post_image: postImg ? postImg : null,
        post_video: postVid ? postVid : null,
        link: `/homescreen/${user.username}/post/${postId}`,
        time: Math.floor(Date.now() / 1000),
        tokenId: tokenId,
        username: user.username,
        linkpreview_data: linkData,
      };

      const feedAnnouncementData = {
        postId: postId,
        announcement: announcement,
        post_image: postImg ? postImg : null,
        post_video: postVid ? postVid : null,
        link: `/homescreen/${user.username}/post/${postId}`,
        time: Math.floor(Date.now() / 1000),
        tokenId: tokenId,
        username: user.username,
        linkpreview_data: linkData,
      };

      let trendValue = {
        user_id: user._id,
        wallet_id: user.wallet_id,
        username: user.username,
        name: user.name,
        profile_image: user.profile_image,
        superfan_data: user.superfan_data,
        content: feedAnnouncementData,
        content_type: 'post',
        reports: user.reports,
        superfan_to: user.superfan_to,
      };

      let taggedAnnouncement = {
        postId: postId,
        announcement: `${user.username} tagged you in a post`,
        post_image: postImg ? postImg : null,
        post_video: postVid ? postVid : null,
        link: `/homescreen/${user.username}/post/${postId}`,
        time: Math.floor(Date.now() / 1000),
        tokenId: tokenId,
        username: user.username,
        linkpreview_data: linkData,
      };

      user.follower_count.forEach(function (id) {
        User.updateOne(
          { username: id },
          { $push: { notification: notificationAnnouncementData } },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
      });

      User.updateOne(
        { username: user.username },
        { $push: { posts: announcementData } },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );

      db.collection('feeds').insertOne(trendValue);

      if (tagged && tagged.length > 0) {
        if (!Array.isArray(tagged)) {
          tagged = tagged.split(',');
        }
        tagged.forEach((value) => {
          User.updateOne(
            { username: value },
            { $push: { notification: taggedAnnouncement } },
            function (error, success) {
              if (error) {
                res.send(error);
              }
            },
          );
        });
      }

      res.send('Hello');
    } catch (err) {
      console.log(err);
    }
  });

router
  .route('/add_tokenid')
  .post(userMiddleware, async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.user_id });
      const tokenId = req.body.tokenId;
      const contentId = req.body.contentId;
      const contentType = req.body.contentType;

      let data;
      let count = -1;
      switch (contentType) {
        case 'post':
          data = user.posts;
          data.forEach((value, i) => {
            if (value.postId == contentId) {
              count = i;
            }
          });
          break;
        case 'video':
          data = user.videos;
          data.forEach((value, i) => {
            if (value.videoId == contentId) {
              count = i;
            }
          });
          break;
      }

      console.log(count);

      if (count != -1) {
        console.log('in2');
        data[count].tokenId = tokenId;
        if (contentType == 'post') {
          User.findOneAndUpdate(
            { username: user.username },
            { $set: { posts: data } },
            function (error, success) {
              if (error) {
                res.send(error);
              }
            },
          );
          Feed.findOneAndUpdate(
            {
              username: user.username,
              'content.postId': contentId,
            },
            { $set: { 'content.tokenId': tokenId } },
            function (error, success) {
              if (error) {
                res.send(error);
              }
            },
          );
        } else if (contentType == 'video') {
          User.findOneAndUpdate(
            { username: user.username },
            { $set: { videos: data } },
            function (error, success) {
              if (error) {
                res.send(error);
              }
            },
          );
          Feed.findOneAndUpdate(
            {
              username: user.username,
              'content.videoId': contentId,
            },
            { $set: { 'content.tokenId': tokenId } },
            function (error, success) {
              if (error) {
                res.send(error);
              }
            },
          );
        }
      }
      res.send('success');
    } catch (err) {
      console.log(err);
    }
  });

// CHECKED MIDDLEWARE
router
  .route('/seennotification')
  .post(userMiddleware, async (req, res) => {
    try {
      // const username = req.body.username;
      const user = await User.findOne({ _id: req.user_id });

      let data = [];
      if (user.oldnotification.length > 0) {
        data = user.oldnotification;
      }
      for (let i = 0; i < user.notification.length; i++) {
        data.push(user.notification[i]);
      }
      await User.updateOne(
        { username: user.username },
        { notification: [] },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
      await User.updateOne(
        { username: user.username },
        { oldnotification: data },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
      res.send('Hello');
    } catch (err) {
      console.log(err);
    }
  });

/**
 * @swagger
 * /user/playlist:
 *   post:
 *     summary: Create/Update a playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  playlistname:
 *                      type: string
 *                      default: my_playlist
 *                  playlist_username:
 *                      type: string
 *                      default: orion
 *                  playlist_data_index:
 *                      type: string
 *                      default: sgabfjs
 *                  data:
 *                      type: object
 *     responses:
 *       200:
 *         description: Playlist created/updated successfully
 *       500:
 *         description: Some server error
 */

// CHECKED MIDDLEWARE
router.route('/playlist').post(userMiddleware, async (req, res) => {
  try {
    const playlistname = req.body.playlistname;
    const data = req.body.data;
    // const username = req.body.username;
    const playlist_username = req.body.playlistUsername;
    const playlist_data_index = req.body.playlistDataIndex;

    const user = await User.findOne({ _id: req.user_id });

    let count = -1;
    if (user.my_playlists) {
      for (let i = 0; i < user.my_playlists.length; i++) {
        if (user.my_playlists[i].playlistname === playlistname) {
          count = i;
          break;
        }
      }
    }

    if (count === -1) {
      let playlistdata = [];

      let sendData = {
        username: playlist_username,
        index: playlist_data_index,
        data: data,
      };

      playlistdata.push(sendData);

      const playlistData = {
        playlistname: playlistname,
        playlistdata: playlistdata,
      };
      User.findOneAndUpdate(
        { username: user.username },
        { $push: { my_playlists: playlistData } },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
    } else {
      let playlistdata = user.my_playlists;

      let sendData = {
        username: playlist_username,
        index: playlist_data_index,
        data: data,
      };

      playlistdata[count].playlistdata.push(sendData);

      User.findOneAndUpdate(
        { username: user.username },
        { $set: { my_playlists: playlistdata } },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
    }
    res.send('success');
  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /user/videoreports:
 *   post:
 *     summary: Report a video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  reporter:
 *                      type: string
 *                      default: mintie_2022
 *                  reported:
 *                      type: string
 *                      default: orion
 *                  report:
 *                      type: string
 *                      default: Violence
 *                  videoId:
 *                      type: string
 *                      default: dsahgvd
 *     responses:
 *       200:
 *         description: Video reported successfully
 *       500:
 *         description: Some server error
 */

router.route('/videoreports').post(async (req, res) => {
  try {
    const reporter = req.body.reporter;
    const reported = req.body.reported;
    const report = req.body.report;
    const id = req.body.id;

    // const user = await User.findOne({ username: repoted });
    let reportData = {
      reporter: reporter,
      reported: reported,
      report: report,
      id: id,
      reportingTime: Date.now(),
    };

    User.findOneAndUpdate(
      { username: reported },
      { $push: { reports: reportData } },
      function (error, success) {
        if (error) {
          res.send(error);
        } else {
          res.send('success');
        }
      },
    );
  } catch (err) {
    console.log(err);
  }
});

// for v2
router.route('/report').post(async (req, res) => {
  try {
    const reporter = req.body.reporter;
    const reported = req.body.reported;
    const report = req.body.report;
    const id = req.body.id;
    const content_type = req.body.content_type;

    // const user = await User.findOne({ username: repoted });
    let reportData = {
      reporter: reporter,
      reported: reported,
      report: report,
      id: id,
      reportingTime: Date.now(),
      content_type: content_type,
    };

    User.findOneAndUpdate(
      { username: reported },
      { $push: { reports: reportData } },
      function (error, success) {
        if (error) {
          res.send(error);
        } else {
          Feed.updateMany(
            { username: reported },
            { $push: { reports: reportData } },
            function (e, s) {
              if (e) {
                res.send(e);
              } else {
                res.send('success');
              }
            },
          );
        }
      },
    );
  } catch (err) {
    console.log(err);
  }
});

// Preference
router.post('/preference', userMiddleware, async (req, res) => {
  // const username = req.body.username;

  const preference = req.body.preference;
  try {
    User.findOneAndUpdate(
      { _id: req.user_id },
      { $set: { preference: preference } },
      (error, success) => {
        if (error) {
          res.send(error);
        }
      },
    );
    res.send('success');
  } catch (err) {
    res.send(err);
    console.log(err);
  }
});

/**
 * @swagger
 * /user/views:
 *   post:
 *     summary: Increment Video View Count
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  videousername:
 *                      type: string
 *                      default: mintie_2022
 *                  videoindex:
 *                      type: string
 *                      default: dsahgvd
 *     responses:
 *       200:
 *         description: View count updated successfully
 *       500:
 *         description: Some server error
 */

//CHECKED MIDDLEWARE
router.route('/views').post(userMiddleware, async (req, res) => {
  try {
    const videoUsername = req.body.videousername;
    const videoindex = req.body.videoindex;
    // const viewedUser = req.body.viewed_user;
    const viewedUser = await User.findOne({ _id: req.user_id });
    const user = await User.findOne({ username: videoUsername });

    let count = -1;
    for (let i = 0; i < user.videos.length; i++) {
      if (user.videos[i].videoId === videoindex) {
        count = i;
        break;
      }
    }

    if (count != -1) {
      let data = user.videos;
      let views = [];
      if (!data[count].views) {
        data[count].views = [];
        data[count].views.push(viewedUser.username);
      } else if (!data[count].views.includes(viewedUser.username)) {
        data[count].views.push(viewedUser.username);
      }

      Feed.findOneAndUpdate(
        {
          username: videoUsername,
          'content.videoId': videoindex,
        },
        { $set: { content: data[count] } },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );

      User.findOneAndUpdate(
        { username: videoUsername },
        { $set: { videos: data } },
        { upsert: true },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
    }
    res.send('success');
  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /user/plays:
 *   post:
 *     summary: Increment Track Play Count
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  trackusername:
 *                      type: string
 *                  trackindex:
 *                      type: string
 *     responses:
 *       200:
 *         description: Play count incremented successfully
 *       500:
 *         description: Some server error
 */

router.route('/plays').post(userMiddleware, async (req, res) => {
  try {
    const trackUsername = req.body.trackusername;
    const trackindex = req.body.trackindex;
    // const viewedUser = req.body.viewed_user;
    const viewedUser = await User.findOne({ _id: req.user_id });
    const user = await User.findOne({ username: trackUsername });

    let count = -1;
    for (let i = 0; i < user.tracks.length; i++) {
      if (user.tracks[i].trackId === trackindex) {
        count = i;
        break;
      }
    }

    if (count != -1) {
      let data = user.tracks;
      let plays = [];
      if (!data[count].plays) {
        data[count].plays.push(viewedUser.username);
      } else if (!data[count].plays.includes(viewedUser.username)) {
        data[count].plays.push(viewedUser.username);
      }

      Feed.findOneAndUpdate(
        {
          username: trackUsername,
          'content.trackId': trackindex,
        },
        { $set: { content: data[count] } },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );

      User.findOneAndUpdate(
        { username: trackUsername },
        { $set: { tracks: data } },
        { upsert: true },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
    }
    res.send('success');
  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /user/trackreactions:
 *   post:
 *     summary: Add/Remove Track Likes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  reactusername:
 *                      type: string
 *                  trackusername:
 *                      type: string
 *                  trackId:
 *                      type: string
 *     responses:
 *       200:
 *         description: Track likes updated successfully
 *       500:
 *         description: Some server error
 */

router
  .route('/trackreactions')
  .post(userMiddleware, async (req, res) => {
    try {
      const reactusername = req.body.reactusername;
      const trackusername = req.body.trackusername;
      const trackId = req.body.trackId;
      const user = await User.findOne({ username: trackusername });

      let count = -1;
      for (let i = 0; i < user.tracks.length; i++) {
        if (user.tracks[i].trackId === trackId) {
          count = i;
          break;
        }
      }

      if (count != -1) {
        let data = user.tracks;
        if (!data[count].likes) {
          data[count].likes = [];
          data[count].likes.push(reactusername);
        } else if (!data[count].likes.includes(reactusername)) {
          data[count].likes.push(reactusername);
        } else if (data[count].likes.includes(reactusername)) {
          let newArray = data[count].likes.filter(
            (item, index) => item != reactusername,
          );
          data[count].likes = newArray;
        }

        if (user.tracks[count].likes.includes(reactusername)) {
          const announcementData = {
            announcement: `${reactusername} liked your track`,
            post_image: user.tracks[count].trackImage
              ? user.tracks[count].trackImage
              : null,
            post_video: null,
            link: `/homescreen/${trackusername}/track/${trackId}`,
            time: Date.now() / 1000,
            username: user.username,
            linkpreview_data: null,
          };
          if (reactusername !== trackusername) {
            User.findOneAndUpdate(
              { username: trackusername },
              {
                $push: {
                  notification: announcementData,
                },
              },
              function (error, success) {
                if (error) {
                  res.send(error);
                }
              },
            );
          }
        }

        User.findOneAndUpdate(
          { username: trackusername },
          { $set: { tracks: data } },
          { upsert: true },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
        Feed.findOneAndUpdate(
          {
            username: trackusername,
            'content.trackId': trackId,
          },
          { $set: { content: data[count] } },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
      }
      res.send('success');
    } catch (err) {
      console.log(err);
    }
  });

function makeid(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * charactersLength),
    );
  }
  return result;
}

/**
 * @swagger
 * /user/postreactions:
 *   post:
 *     summary: Add/Remove Post Likes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  reactusername:
 *                      type: string
 *                  postusername:
 *                      type: string
 *                  postId:
 *                      type: string
 *     responses:
 *       200:
 *         description: Post likes updated successfully
 *       500:
 *         description: Some server error
 */

router
  .route('/postreactions')
  .post(userMiddleware, async (req, res) => {
    try {
      const reactusername = req.body.reactusername;
      const postusername = req.body.postusername;
      const postId = req.body.postId;

      const user = await User.findOne({ username: postusername });

      let count = -1;
      for (let i = 0; i < user.posts.length; i++) {
        if (user.posts[i].postId === postId) {
          count = i;
          break;
        }
      }

      if (count != -1) {
        let data = user.posts;
        if (!data[count].likes) {
          data[count].likes = [];
          data[count].likes.push(reactusername);
        } else if (!data[count].likes.includes(reactusername)) {
          data[count].likes.push(reactusername);
        } else if (data[count].likes.includes(reactusername)) {
          let newArray = data[count].likes.filter(
            (item, index) => item != reactusername,
          );
          data[count].likes = newArray;
        }

        if (user.posts[count].likes.includes(reactusername)) {
          const announcementData = {
            announcement: `${reactusername} liked your post`,
            post_image: user.posts[count].post_image
              ? user.posts[count].post_image
              : null,
            post_video: null,
            link: `/homescreen/${postusername}/post/${postId}`,
            time: Date.now() / 1000,
            username: user.username,
            linkpreview_data: null,
          };
          if (reactusername !== postusername) {
            User.findOneAndUpdate(
              { username: postusername },
              {
                $push: {
                  notification: announcementData,
                },
              },
              function (error, success) {
                if (error) {
                  res.send(error);
                }
              },
            );
          }
        }

        User.findOneAndUpdate(
          { username: postusername },
          { $set: { posts: data } },
          { upsert: true },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );

        Feed.findOneAndUpdate(
          {
            username: postusername,
            'content.postId': postId,
          },
          { $set: { content: data[count] } },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
      }
      res.send('success');
    } catch (err) {
      console.log(err);
    }
  });

/**
 * @swagger
 * /user/videoreactions:
 *   post:
 *     summary: Add/Remove Track Likes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  reactusername:
 *                      type: string
 *                  videousername:
 *                      type: string
 *                  videoId:
 *                      type: string
 *     responses:
 *       200:
 *         description: Video likes updated successfully
 *       500:
 *         description: Some server error
 */

router
  .route('/videoreactions')
  .post(userMiddleware, async (req, res) => {
    try {
      const reactusername = req.body.reactusername;
      const videousername = req.body.videousername;
      const videoId = req.body.videoId;
      const user = await User.findOne({ username: videousername });

      let count = -1;
      for (let i = 0; i < user.videos.length; i++) {
        if (user.videos[i].videoId === videoId) {
          count = i;
          break;
        }
      }

      if (count != -1) {
        let data = user.videos;
        if (!data[count].likes) {
          data[count].likes = [];
          data[count].likes.push(reactusername);
        } else if (!data[count].likes.includes(reactusername)) {
          data[count].likes.push(reactusername);
        } else if (data[count].likes.includes(reactusername)) {
          let newArray = data[count].likes.filter(
            (item, index) => item != reactusername,
          );
          data[count].likes = newArray;
        }

        if (user.videos[count].likes.includes(reactusername)) {
          const announcementData = {
            announcement: `${reactusername} liked your video`,
            post_image: user.videos[count].videoImage
              ? user.videos[count].videoImage
              : null,
            post_video: null,
            link: `/homescreen/${videousername}/video/${videoId}`,
            time: Date.now() / 1000,
            username: user.username,
            linkpreview_data: null,
          };
          if (reactusername !== videousername) {
            User.findOneAndUpdate(
              { username: videousername },
              {
                $push: {
                  notification: announcementData,
                },
              },
              function (error, success) {
                if (error) {
                  res.send(error);
                }
              },
            );
          }
        }

        User.findOneAndUpdate(
          { username: videousername },
          { $set: { videos: data } },
          { upsert: true },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );

        Feed.findOneAndUpdate(
          {
            username: videousername,
            'content.videoId': videoId,
          },
          { $set: { content: data[count] } },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
      }
      res.send('success');
    } catch (err) {
      console.log(err);
    }
  });

/**
 * @swagger
 * /user/pollreactions:
 *   post:
 *     summary: Add/Remove Track Likes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  reactusername:
 *                      type: string
 *                  pollusername:
 *                      type: string
 *                  pollId:
 *                      type: string
 *     responses:
 *       200:
 *         description: poll likes updated successfully
 *       500:
 *         description: Some server error
 */

router
  .route('/pollreactions')
  .post(userMiddleware, async (req, res) => {
    console.log(req.body);
    try {
      const reactusername = req.body.reactusername;
      const pollusername = req.body.pollusername;
      const pollId = req.body.pollId;
      const user = await User.findOne({ username: pollusername });

      let count = -1;
      for (let i = 0; i < user.polls.length; i++) {
        if (user.polls[i].pollId === pollId) {
          count = i;
          break;
        }
      }

      if (count != -1) {
        let data = user.polls;
        if (!data[count].likes) {
          data[count].likes = [];
          data[count].likes.push(reactusername);
        } else if (!data[count].likes.includes(reactusername)) {
          data[count].likes.push(reactusername);
        } else if (data[count].likes.includes(reactusername)) {
          let newArray = data[count].likes.filter(
            (item, index) => item != reactusername,
          );
          data[count].likes = newArray;
        }

        if (user.polls[count].likes.includes(reactusername)) {
          console.log(`${reactusername} liked your poll`);
          const announcementData = {
            announcement: `${reactusername} liked your poll`,
            post_image: user.polls[count].pollImage
              ? user.polls[count].pollImage
              : null,
            post_video: null,
            link: `/homescreen/${pollusername}/poll/${pollId}`,
            time: Date.now() / 1000,
            username: user.username,
            linkpreview_data: null,
          };
          if (reactusername !== pollusername) {
            User.findOneAndUpdate(
              { username: pollusername },
              {
                $push: {
                  notification: announcementData,
                },
              },
              function (error, success) {
                if (error) {
                  res.send(error);
                }
              },
            );
          }
        }

        User.findOneAndUpdate(
          { username: pollusername },
          { $set: { polls: data } },
          { upsert: true },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );

        Feed.findOneAndUpdate(
          {
            username: pollusername,
            'content.pollId': pollId,
          },
          { $set: { content: data[count] } },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
      }
      res.send('success');
    } catch (err) {
      console.log(err);
    }
  });

/**
 * @swagger
 * /user/pollVote:
 *   post:
 *     summary: Vote a poll
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  reactusername:
 *                      type: string
 *                  pollusername:
 *                      type: string
 *                  pollId:
 *                      type: string
 *                  voted:
 *                      type: integer
 *     responses:
 *       200:
 *         description: Voted Successfully
 *       500:
 *         description: Some server error
 */

router.route('/pollVote').post(userMiddleware, async (req, res) => {
  try {
    const reactusername = req.body.reactusername;
    const pollusername = req.body.pollusername;
    const pollId = req.body.pollId;
    const voted = req.body.voted;
    const user = await User.findOne({ username: pollusername });

    let count = -1;
    for (let i = 0; i < user.polls.length; i++) {
      if (user.polls[i].pollId === pollId) {
        count = i;
        break;
      }
    }

    if (count != -1) {
      let data = user.polls;
      if (!data[count].options[voted].selectedBy) {
        data[count].options[voted].selectedBy = [];
        data[count].options[voted].selectedBy.push(reactusername);
        data[count].votes.push(reactusername);
      } else if (
        !data[count].options[voted].selectedBy.includes(reactusername)
      ) {
        data[count].options[voted].selectedBy.push(reactusername);
        data[count].votes.push(reactusername);
      } else if (
        data[count].options[voted].selectedBy.includes(reactusername)
      ) {
        let newArray = data[count].options[voted].selectedBy.filter(
          (item, index) => item != reactusername,
        );
        data[count].options[voted].selectedBy = newArray;
        newArray = data[count].votes.filter(
          (item, index) => item != reactusername,
        );

        data[count].votes = newArray;
      }

      if (
        user.polls[count].options[voted].selectedBy.includes(
          reactusername,
        )
      ) {
        const announcementData = {
          announcement: `${reactusername} voted to your poll`,
          post_image: user.polls[count].pollImage
            ? user.polls[count].pollImage
            : null,
          post_video: null,
          link: `/homescreen/${pollusername}/poll/${pollId}`,
          time: Date.now() / 1000,
          username: user.username,
          linkpreview_data: null,
        };
        User.findOneAndUpdate(
          { username: pollusername },
          {
            $push: {
              notification: announcementData,
            },
          },
          function (error, success) {
            if (error) {
              res.send(error);
            }
          },
        );
      }

      User.findOneAndUpdate(
        { username: pollusername },
        { $set: { polls: data } },
        { upsert: true },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );

      Feed.findOneAndUpdate(
        {
          username: pollusername,
          'content.pollId': pollId,
        },
        { $set: { content: data[count] } },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
    }
    res.send('success');
  } catch (err) {
    console.log(err);
  }
});

/**
 * @swagger
 * /user/uploadThumbnail:
 *   post:
 *     summary: Upload live stream thumbnail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  url:
 *                      type: string
 *                      default: your ipfs file link here
 *     responses:
 *       200:
 *         description: Thumbnail uploaded successfully
 *       500:
 *         description: Some server error
 */

//MIDDLEWARE TEST PENDING
router.post('/uploadThumbnail', userMiddleware, async (req, res) => {
  try {
    const url = req.body.url;
    // const username = req.body.username;
    User.findOneAndUpdate(
      { _id: req.user_id },

      { $set: { thumbnail: url } },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );

    res.status(201).send('Thumbnail Uploaded');
  } catch (error) {
    res.send(error);
  }
});

/**
 * @swagger
 * /user/post:
 *  delete:
 *      description: Post deletion
 *      required: true
 *      responses:
 *          200:
 *              description: Cannot delete post
 */

// Delete Post
router.delete('/post', userMiddleware, async (req, res) => {
  try {
    console.log(req.body);

    User.findOneAndUpdate(
      { _id: req.user_id },
      { $pull: { posts: req.body } },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );

    Feed.deleteOne(
      { 'content.postId': req.body.postId },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );

    res.status(201).send('success');
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /user/track:
 *  delete:
 *      description: Track deletion
 *      required: true
 *      responses:
 *          200:
 *              description: Cannot delete a track
 */

router.delete('/track', userMiddleware, async (req, res) => {
  try {
    User.findOneAndUpdate(
      { _id: req.user_id },
      { $pull: { tracks: req.body } },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );
    Feed.deleteOne(
      { 'content.trackId': req.body.trackId },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );

    res.status(201).send('success');
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /user/video:
 *  delete:
 *      description: Video deletion
 *      required: true
 *      responses:
 *          200:
 *              description: Cannot delete a video
 */

router.delete('/video', userMiddleware, async (req, res) => {
  try {
    console.log(req.body);

    User.findOneAndUpdate(
      { _id: req.user_id },
      { $pull: { videos: req.body } },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );

    Feed.deleteOne(
      { 'content.videoId': req.body.videoId },
      function (error, success) {
        if (error) {
          res.send(error);
        }
      },
    );
    res.status(201).send('success');
  } catch (error) {
    console.log(error);
  }
});

router.delete('/postdelete', userMiddleware, async (req, res) => {
  try {
    console.log(req.body);
    let pullFromUsers;
    let pullFromFeed;

    if (req.body.postId) {
      User.findOneAndUpdate(
        { _id: req.user_id },
        { $pull: { posts: req.body } },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );

      Feed.deleteOne(
        { 'content.postId': req.body.postId },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
      res.status(201).send('success');
    } else if (req.body.trackId) {
      User.findOneAndUpdate(
        { _id: req.user_id },
        { $pull: { tracks: req.body } },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );

      Feed.deleteOne(
        { 'content.trackId': req.body.trackId },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
      res.status(201).send('success');
    } else if (req.body.videoId) {
      User.findOneAndUpdate(
        { _id: req.user_id },
        { $pull: { videos: req.body } },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );

      Feed.deleteOne(
        { 'content.videoId': req.body.videoId },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
      res.status(201).send('success');
    } else if (req.body.pollId) {
      User.findOneAndUpdate(
        { _id: req.user_id },
        { $pull: { polls: req.body } },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );

      Feed.deleteOne(
        { 'content.pollId': req.body.pollId },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
      res.status(201).send('success');
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /user/addcomment:
 *   post:
 *     summary: Adding a comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  user_data_id:
 *                      type: string
 *                      default: 6232fb34ba083727b3879abb
 *                  comment:
 *                      type: string
 *                      default: awesome
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       500:
 *         description: Some server error
 */
router.post('/addcomment', userMiddleware, async (req, res) => {
  try {
    var id = new mongoose.Types.ObjectId();
    const { user_data_id, content, comment, replyTo } = req.body;
    let user = await User.findById(user_data_id);

    let cuser = await User.findOne({ _id: req.user_id });

    // For Notification
    let announcementData = {
      announcement: `${cuser.username} commented on your post`,
      post_image: cuser.profile_image ? cuser.profile_image : null,
      post_video: null,
      link: `/homescreen/profile/${cuser.username}`,
      time: Date.now() / 1000,
      username: cuser.username,
      linkpreview_data: null,
    };

    if (content.videoId) {
      let obj = user.videos.find((video, i) => {
        if (video.videoId == content.videoId) {
          if (user.videos[i].comments) {
            if (replyTo) {
              user.videos[i].comments.find((c, j) => {
                if (c._id == replyTo) {
                  if (user.videos[i].comments[j].reply) {
                    user.videos[i].comments[j].reply.push({
                      _id: id,
                      user_id: req.user_id,
                      comment: comment,
                      likes: [],
                    });
                  } else {
                    user.videos[i].comments[j].reply = [
                      {
                        _id: id,
                        user_id: req.user_id,
                        comment: comment,
                        likes: [],
                      },
                    ];
                  }

                  // For notification to reply user
                  let ad = {
                    announcement: `${cuser.username} replied to your comment on video of ${user.username}`,
                    post_image: cuser.profile_image
                      ? cuser.profile_image
                      : null,
                    post_video: null,
                    link: `/homescreen/${user.username}/video/${user.videos[i].videoId}`,
                    time: Date.now() / 1000,
                    username: cuser.username,
                    linkpreview_data: null,
                  };

                  User.findOneAndUpdate(
                    { _id: c.user_id },
                    {
                      $push: {
                        notification: ad,
                      },
                    },
                    function (error, success) {
                      if (error) {
                        res.send(error);
                      }
                    },
                  );
                }
              });
            } else {
              user.videos[i].comments.push({
                _id: id,
                user_id: req.user_id,
                comment: comment,
                likes: [],
              });
            }
          } else {
            user.videos[i].comments = [
              {
                _id: id,
                user_id: req.user_id,
                comment: comment,
                likes: [],
              },
            ];
          }

          // For notification
          announcementData.announcement = `${cuser.username} commented on your video`;
          announcementData.link = `/homescreen/${user.username}/video/${user.videos[i].videoId}`;
          user.notification.push(announcementData);

          return true; // stop searching
        }
      });
      // for trending
      let trending = await Feed.findOne({
        'content.videoId': content.videoId,
      });
      if (trending) {
        if (trending.content.comments) {
          if (replyTo) {
            trending.content.comments.find((c, i) => {
              if (c._id == replyTo) {
                if (trending.content.comments[i].reply) {
                  trending.content.comments[i].reply.push({
                    _id: id,
                    user_id: req.user_id,
                    comment: comment,
                    likes: [],
                  });
                } else {
                  trending.content.comments[i].reply = [
                    {
                      _id: id,
                      user_id: req.user_id,
                      comment: comment,
                      likes: [],
                    },
                  ];
                }
              }
            });
          } else {
            trending.content.comments.push({
              _id: id,
              user_id: req.user_id,
              comment: comment,
              likes: [],
            });
          }
        } else {
          trending.content.comments = [
            {
              _id: id,
              user_id: req.user_id,
              comment: comment,
              likes: [],
            },
          ];
        }
      }
      if (obj) {
        await user.markModified('videos');
        await user.save();
        // trending
        await trending.markModified('content.comments');
        await trending.save();
        res.send({ id: id });
      }
    } else if (content.trackId) {
      let obj = user.tracks.find((track, i) => {
        if (track.trackId == content.trackId) {
          if (user.tracks[i].comments) {
            if (replyTo) {
              user.tracks[i].comments.find((c, j) => {
                if (c._id == replyTo) {
                  if (user.tracks[i].comments[j].reply) {
                    user.tracks[i].comments[j].reply.push({
                      _id: id,
                      user_id: req.user_id,
                      comment: comment,
                      likes: [],
                    });
                  } else {
                    user.tracks[i].comments[j].reply = [
                      {
                        _id: id,
                        user_id: req.user_id,
                        comment: comment,
                        likes: [],
                      },
                    ];
                  }

                  // For notification to reply user
                  let ad = {
                    announcement: `${cuser.username} replied to your comment on track of ${user.username}`,
                    post_image: cuser.profile_image
                      ? cuser.profile_image
                      : null,
                    post_video: null,
                    link: `/homescreen/${user.username}/track/${user.tracks[i].trackId}`,
                    time: Date.now() / 1000,
                    username: cuser.username,
                    linkpreview_data: null,
                  };

                  User.findOneAndUpdate(
                    { _id: c.user_id },
                    {
                      $push: {
                        notification: ad,
                      },
                    },
                    function (error, success) {
                      if (error) {
                        res.send(error);
                      }
                    },
                  );
                }
              });
            } else {
              user.tracks[i].comments.push({
                _id: id,
                user_id: req.user_id,
                comment: comment,
                likes: [],
              });
            }
          } else {
            user.tracks[i].comments = [
              {
                _id: id,
                user_id: req.user_id,
                comment: comment,
                likes: [],
              },
            ];
          }

          // For notification
          announcementData.announcement = `${cuser.username} commented on your track`;
          announcementData.link = `/homescreen/${user.username}/track/${user.tracks[i].trackId}`;
          user.notification.push(announcementData);

          return true; // stop searching
        }
      });
      // for trending
      let trending = await Feed.findOne({
        'content.trackId': content.trackId,
      });
      if (trending) {
        if (trending.content.comments) {
          if (replyTo) {
            trending.content.comments.find((c, i) => {
              if (c._id == replyTo) {
                if (trending.content.comments[i].reply) {
                  trending.content.comments[i].reply.push({
                    _id: id,
                    user_id: req.user_id,
                    comment: comment,
                    likes: [],
                  });
                } else {
                  trending.content.comments[i].reply = [
                    {
                      _id: id,
                      user_id: req.user_id,
                      comment: comment,
                      likes: [],
                    },
                  ];
                }
              }
            });
          } else {
            trending.content.comments.push({
              _id: id,
              user_id: req.user_id,
              comment: comment,
              likes: [],
            });
          }
        } else {
          trending.content.comments = [
            {
              _id: id,
              user_id: req.user_id,
              comment: comment,
              likes: [],
            },
          ];
        }
      }

      if (obj) {
        await user.markModified('tracks');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();

        res.send({ id: id });
      }
    } else if (content.announcement) {
      let obj = user.posts.find((post, i) => {
        if (post.postId == content.postId) {
          if (user.posts[i].comments) {
            if (replyTo) {
              user.posts[i].comments.find((c, j) => {
                if (c._id == replyTo) {
                  if (user.posts[i].comments[j].reply) {
                    user.posts[i].comments[j].reply.push({
                      _id: id,
                      user_id: req.user_id,
                      comment: comment,
                      likes: [],
                    });
                  } else {
                    user.posts[i].comments[j].reply = [
                      {
                        _id: id,
                        user_id: req.user_id,
                        comment: comment,
                        likes: [],
                      },
                    ];
                  }

                  // For notification to reply user
                  let ad = {
                    announcement: `${cuser.username} replied to your comment on post of ${user.username}`,
                    post_image: cuser.profile_image
                      ? cuser.profile_image
                      : null,
                    post_video: null,
                    link: `/homescreen/${user.username}/post/${user.posts[i].postId}`,
                    time: Date.now() / 1000,
                    username: cuser.username,
                    linkpreview_data: null,
                  };

                  console.log(ad);
                  console.log('sending to', c.user_id);

                  User.findOneAndUpdate(
                    { _id: c.user_id },
                    {
                      $push: {
                        notification: ad,
                      },
                    },
                    function (error, success) {
                      if (error) {
                        console.log(error);
                      }
                    },
                  );
                }
              });
            } else {
              user.posts[i].comments.push({
                _id: id,
                user_id: req.user_id,
                comment: comment,
                likes: [],
              });
            }
          } else {
            user.posts[i].comments = [
              {
                _id: id,
                user_id: req.user_id,
                comment: comment,
                likes: [],
              },
            ];
          }

          // For notification
          announcementData.announcement = `${cuser.username} commented on your post`;
          announcementData.link = `/homescreen/${user.username}/post/${user.posts[i].postId}`;
          user.notification.push(announcementData);

          return true; // stop searching
        }
      });

      // for trending
      let trending = await Feed.findOne({
        // user_id: user_data_id,
        'content.postId': content.postId,
      });

      if (trending) {
        if (trending.content.comments) {
          if (replyTo) {
            trending.content.comments.find((c, i) => {
              if (c._id == replyTo) {
                if (trending.content.comments[i].reply) {
                  trending.content.comments[i].reply.push({
                    _id: id,
                    user_id: req.user_id,
                    comment: comment,
                    likes: [],
                  });
                } else {
                  trending.content.comments[i].reply = [
                    {
                      _id: id,
                      user_id: req.user_id,
                      comment: comment,
                      likes: [],
                    },
                  ];
                }
              }
            });
          } else {
            trending.content.comments.push({
              _id: id,
              user_id: req.user_id,
              comment: comment,
              likes: [],
            });
          }
        } else {
          trending.content.comments = [
            {
              _id: id,
              user_id: req.user_id,
              comment: comment,
              likes: [],
            },
          ];
        }
      }

      if (obj) {
        await user.markModified('posts');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();

        res.send({ id: id });
      }
    } else if (content.pollId) {
      console.log('in');
      let obj = user.polls.find((poll, i) => {
        if (poll.pollId == content.pollId) {
          if (user.polls[i].comments) {
            if (replyTo) {
              user.polls[i].comments.find((c, j) => {
                if (c._id == replyTo) {
                  if (user.polls[i].comments[j].reply) {
                    user.polls[i].comments[j].reply.push({
                      _id: id,
                      user_id: req.user_id,
                      comment: comment,
                      likes: [],
                    });
                  } else {
                    user.polls[i].comments[j].reply = [
                      {
                        _id: id,
                        user_id: req.user_id,
                        comment: comment,
                        likes: [],
                      },
                    ];
                  }

                  // For notification to reply user
                  let ad = {
                    announcement: `${cuser.username} replied to your comment on poll of ${user.username}`,
                    post_image: cuser.profile_image
                      ? cuser.profile_image
                      : null,
                    post_video: null,
                    link: `/homescreen/${user.username}/poll/${user.polls[i].pollId}`,
                    time: Date.now() / 1000,
                    username: cuser.username,
                    linkpreview_data: null,
                  };

                  User.findOneAndUpdate(
                    { _id: c.user_id },
                    {
                      $push: {
                        notification: ad,
                      },
                    },
                    function (error, success) {
                      if (error) {
                        res.send(error);
                      }
                    },
                  );
                }
              });
            } else {
              user.polls[i].comments.push({
                _id: id,
                user_id: req.user_id,
                comment: comment,
                likes: [],
              });
            }
          } else {
            user.polls[i].comments = [
              {
                _id: id,
                user_id: req.user_id,
                comment: comment,
                likes: [],
              },
            ];
          }

          // For notification
          announcementData.announcement = `${cuser.username} commented on your poll`;
          announcementData.link = `/homescreen/${user.username}/poll/${user.polls[i].pollId}`;
          user.notification.push(announcementData);

          return true; // stop searching
        }
      });

      // for trending
      let trending = await Feed.findOne({
        // user_id: user_data_id,
        'content.pollId': content.pollId,
      });

      if (trending) {
        if (trending.content.comments) {
          if (replyTo) {
            trending.content.comments.find((c, i) => {
              if (c._id == replyTo) {
                if (trending.content.comments[i].reply) {
                  trending.content.comments[i].reply.push({
                    _id: id,
                    user_id: req.user_id,
                    comment: comment,
                    likes: [],
                  });
                } else {
                  trending.content.comments[i].reply = [
                    {
                      _id: id,
                      user_id: req.user_id,
                      comment: comment,
                      likes: [],
                    },
                  ];
                }
              }
            });
          } else {
            trending.content.comments.push({
              _id: id,
              user_id: req.user_id,
              comment: comment,
              likes: [],
            });
          }
        } else {
          trending.content.comments = [
            {
              _id: id,
              user_id: req.user_id,
              comment: comment,
              likes: [],
            },
          ];
        }
      }

      if (obj) {
        await user.markModified('polls');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();

        res.send({ id: id });
      }
    }
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});
router.post('/likecomment', userMiddleware, async (req, res) => {
  try {
    const { user_data_id, content, comment, replyTo } = req.body;
    let user = await User.findOne({ _id: user_data_id });

    let cuser = await User.findOne({ _id: req.user_id });

    // For Notification
    let announcementData = {
      announcement: `${cuser.username} liked your comment on post of ${user.username}`,
      post_image: cuser.profile_image ? cuser.profile_image : null,
      post_video: null,
      link: `/homescreen/profile/${cuser.username}`,
      time: Date.now() / 1000,
      username: cuser.username,
      linkpreview_data: null,
    };
    let tonotification = null;

    if (content.videoId) {
      let obj = user.videos.find((video, i) => {
        if (video.videoId == content.videoId) {
          if (user.videos[i].comments) {
            return user.videos[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.videos[i].comments[j].reply) {
                  return user.videos[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        if (
                          user.videos[i].comments[j].reply[
                            k
                          ].likes.includes(req.user_id)
                        ) {
                          user.videos[i].comments[j].reply[
                            k
                          ].likes.splice(
                            user.videos[i].comments[j].reply[
                              k
                            ].likes.indexOf(req.user_id),
                            1,
                          );

                          announcementData.announcement = `${cuser.username} unliked your reply comment on video of ${user.username}`;
                        } else {
                          user.videos[i].comments[j].reply[
                            k
                          ].likes.push(req.user_id);

                          announcementData.announcement = `${cuser.username} liked your reply comment on video of ${user.username}`;
                        }

                        // FOr notification
                        tonotification =
                          user.videos[i].comments[j].reply[k].user_id;
                        announcementData.link = `/homescreen/${user.username}/video/${user.videos[i].videoId}`;

                        // For notification
                        User.findOneAndUpdate(
                          { _id: tonotification },
                          {
                            $push: {
                              notification: announcementData,
                            },
                          },
                          function (error, success) {
                            if (error) {
                              res.send(error);
                            }
                          },
                        );

                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  if (
                    user.videos[i].comments[j].likes.includes(
                      req.user_id,
                    )
                  ) {
                    user.videos[i].comments[j].likes.splice(
                      user.videos[i].comments[j].likes.indexOf(
                        req.user_id,
                      ),
                      1,
                    );
                    announcementData.announcement = `${cuser.username} unliked your comment on video of ${user.username}`;
                  } else {
                    user.videos[i].comments[j].likes.push(
                      req.user_id,
                    );
                    announcementData.announcement = `${cuser.username} liked your comment on video of ${user.username}`;
                  }
                  // FOr notification
                  tonotification = user.videos[i].comments[j].user_id;
                  announcementData.link = `/homescreen/${user.username}/video/${user.videos[i].videoId}`;

                  // For notification
                  User.findOneAndUpdate(
                    { _id: tonotification },
                    {
                      $push: {
                        notification: announcementData,
                      },
                    },
                    function (error, success) {
                      if (error) {
                        res.send(error);
                      }
                    },
                  );
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });
      // for trending
      let trending = await Feed.findOne({
        'content.videoId': content.videoId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    if (
                      trending.content.comments[j].reply[
                        k
                      ].likes.includes(req.user_id)
                    ) {
                      trending.content.comments[j].reply[
                        k
                      ].likes.splice(
                        trending.content.comments[j].reply[
                          k
                        ].likes.indexOf(req.user_id),
                        1,
                      );
                    } else {
                      trending.content.comments[j].reply[
                        k
                      ].likes.push(req.user_id);
                    }
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              if (
                trending.content.comments[j].likes.includes(
                  req.user_id,
                )
              ) {
                trending.content.comments[j].likes.splice(
                  trending.content.comments[j].likes.indexOf(
                    req.user_id,
                  ),
                  1,
                );
              } else {
                trending.content.comments[j].likes.push(req.user_id);
              }
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('videos');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();

        res.send('success');
      }
    } else if (content.trackId) {
      let obj = user.tracks.find((track, i) => {
        if (track.trackId == content.trackId) {
          if (user.tracks[i].comments) {
            return user.tracks[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.tracks[i].comments[j].reply) {
                  return user.tracks[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        if (
                          user.tracks[i].comments[j].reply[
                            k
                          ].likes.includes(req.user_id)
                        ) {
                          user.tracks[i].comments[j].reply[
                            k
                          ].likes.splice(
                            user.tracks[i].comments[j].reply[
                              k
                            ].likes.indexOf(req.user_id),
                            1,
                          );
                          announcementData.announcement = `${cuser.username} unliked your reply comment on track of ${user.username}`;
                        } else {
                          user.tracks[i].comments[j].reply[
                            k
                          ].likes.push(req.user_id);

                          announcementData.announcement = `${cuser.username} liked your reply comment on track of ${user.username}`;
                        }
                        // FOr notification
                        tonotification =
                          user.tracks[i].comments[j].reply[k].user_id;
                        announcementData.link = `/homescreen/${user.username}/track/${user.tracks[i].trackId}`;

                        // For notification
                        User.findOneAndUpdate(
                          { _id: tonotification },
                          {
                            $push: {
                              notification: announcementData,
                            },
                          },
                          function (error, success) {
                            if (error) {
                              res.send(error);
                            }
                          },
                        );
                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  if (
                    user.tracks[i].comments[j].likes.includes(
                      req.user_id,
                    )
                  ) {
                    user.tracks[i].comments[j].likes.splice(
                      user.tracks[i].comments[j].likes.indexOf(
                        req.user_id,
                      ),
                      1,
                    );
                    announcementData.announcement = `${cuser.username} unliked your comment on track of ${user.username}`;
                  } else {
                    user.tracks[i].comments[j].likes.push(
                      req.user_id,
                    );
                    announcementData.announcement = `${cuser.username} liked your comment on track of ${user.username}`;
                  }
                  tonotification = user.tracks[i].comments[j].user_id;
                  announcementData.link = `/homescreen/${user.username}/track/${user.tracks[i].trackId}`;

                  // For notification
                  User.findOneAndUpdate(
                    { _id: tonotification },
                    {
                      $push: {
                        notification: announcementData,
                      },
                    },
                    function (error, success) {
                      if (error) {
                        res.send(error);
                      }
                    },
                  );
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });

      // for trending
      let trending = await Feed.findOne({
        'content.trackId': content.trackId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    if (
                      trending.content.comments[j].reply[
                        k
                      ].likes.includes(req.user_id)
                    ) {
                      trending.content.comments[j].reply[
                        k
                      ].likes.splice(
                        trending.content.comments[j].reply[
                          k
                        ].likes.indexOf(req.user_id),
                        1,
                      );
                    } else {
                      trending.content.comments[j].reply[
                        k
                      ].likes.push(req.user_id);
                    }
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              if (
                trending.content.comments[j].likes.includes(
                  req.user_id,
                )
              ) {
                trending.content.comments[j].likes.splice(
                  trending.content.comments[j].likes.indexOf(
                    req.user_id,
                  ),
                  1,
                );
              } else {
                trending.content.comments[j].likes.push(req.user_id);
              }
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('tracks');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();
        res.send('success');
      }
    } else if (content.announcement) {
      let obj = user.posts.find((post, i) => {
        if (post.postId == content.postId) {
          if (user.posts[i].comments) {
            return user.posts[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.posts[i].comments[j].reply) {
                  return user.posts[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        if (
                          user.posts[i].comments[j].reply[
                            k
                          ].likes.includes(req.user_id)
                        ) {
                          user.posts[i].comments[j].reply[
                            k
                          ].likes.splice(
                            user.posts[i].comments[j].reply[
                              k
                            ].likes.indexOf(req.user_id),
                            1,
                          );

                          announcementData.announcement = `${cuser.username} unliked your reply comment on post of ${user.username}`;
                        } else {
                          user.posts[i].comments[j].reply[
                            k
                          ].likes.push(req.user_id);

                          announcementData.announcement = `${cuser.username} liked your reply comment on post of ${user.username}`;
                        }

                        tonotification =
                          user.posts[i].comments[j].reply[k].user_id;
                        announcementData.link = `/homescreen/${user.username}/post/${user.posts[i].postId}`;

                        // For notification
                        User.findOneAndUpdate(
                          { _id: tonotification },
                          {
                            $push: {
                              notification: announcementData,
                            },
                          },
                          function (error, success) {
                            if (error) {
                              res.send(error);
                            }
                          },
                        );
                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  if (
                    user.posts[i].comments[j].likes.includes(
                      req.user_id,
                    )
                  ) {
                    user.posts[i].comments[j].likes.splice(
                      user.posts[i].comments[j].likes.indexOf(
                        req.user_id,
                      ),
                      1,
                    );
                    announcementData.announcement = `${cuser.username} unliked your comment on post of ${user.username}`;
                  } else {
                    user.posts[i].comments[j].likes.push(req.user_id);

                    announcementData.announcement = `${cuser.username} liked your reply comment on post of ${user.username}`;
                  }

                  tonotification = user.posts[i].comments[j].user_id;
                  announcementData.link = `/homescreen/${user.username}/post/${user.posts[i].postId}`;

                  // For notification
                  User.findOneAndUpdate(
                    { _id: tonotification },
                    {
                      $push: {
                        notification: announcementData,
                      },
                    },
                    function (error, success) {
                      if (error) {
                        res.send(error);
                      }
                    },
                  );
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });
      // for trending
      let trending = await Feed.findOne({
        // user_id: user_data_id,
        'content.postId': content.postId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    if (
                      trending.content.comments[j].reply[
                        k
                      ].likes.includes(req.user_id)
                    ) {
                      trending.content.comments[j].reply[
                        k
                      ].likes.splice(
                        trending.content.comments[j].reply[
                          k
                        ].likes.indexOf(req.user_id),
                        1,
                      );
                    } else {
                      trending.content.comments[j].reply[
                        k
                      ].likes.push(req.user_id);
                    }
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              if (
                trending.content.comments[j].likes.includes(
                  req.user_id,
                )
              ) {
                trending.content.comments[j].likes.splice(
                  trending.content.comments[j].likes.indexOf(
                    req.user_id,
                  ),
                  1,
                );
              } else {
                trending.content.comments[j].likes.push(req.user_id);
              }
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('posts');
        await user.save();
        // trending
        await trending.markModified('content.comments');
        await trending.save();
        res.send('success');
      }
    } else if (content.pollId) {
      let obj = user.polls.find((poll, i) => {
        if (poll.pollId == content.pollId) {
          if (user.polls[i].comments) {
            return user.polls[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.polls[i].comments[j].reply) {
                  return user.polls[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        if (
                          user.polls[i].comments[j].reply[
                            k
                          ].likes.includes(req.user_id)
                        ) {
                          user.polls[i].comments[j].reply[
                            k
                          ].likes.splice(
                            user.polls[i].comments[j].reply[
                              k
                            ].likes.indexOf(req.user_id),
                            1,
                          );

                          announcementData.announcement = `${cuser.username} unliked your reply comment on poll of ${user.username}`;
                        } else {
                          user.polls[i].comments[j].reply[
                            k
                          ].likes.push(req.user_id);

                          announcementData.announcement = `${cuser.username} liked your reply comment on poll of ${user.username}`;
                        }

                        tonotification =
                          user.polls[i].comments[j].reply[k].user_id;
                        announcementData.link = `/homescreen/${user.username}/poll/${user.polls[i].pollId}`;

                        // For notification
                        User.findOneAndUpdate(
                          { _id: tonotification },
                          {
                            $push: {
                              notification: announcementData,
                            },
                          },
                          function (error, success) {
                            if (error) {
                              res.send(error);
                            }
                          },
                        );
                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  if (
                    user.polls[i].comments[j].likes.includes(
                      req.user_id,
                    )
                  ) {
                    user.polls[i].comments[j].likes.splice(
                      user.polls[i].comments[j].likes.indexOf(
                        req.user_id,
                      ),
                      1,
                    );
                    announcementData.announcement = `${cuser.username} unliked your comment on poll of ${user.username}`;
                  } else {
                    user.polls[i].comments[j].likes.push(req.user_id);
                    announcementData.announcement = `${cuser.username} liked your comment on poll of ${user.username}`;
                  }

                  tonotification = user.polls[i].comments[j].user_id;
                  announcementData.link = `/homescreen/${user.username}/poll/${user.polls[i].pollId}`;

                  // For notification
                  User.findOneAndUpdate(
                    { _id: tonotification },
                    {
                      $push: {
                        notification: announcementData,
                      },
                    },
                    function (error, success) {
                      if (error) {
                        res.send(error);
                      }
                    },
                  );
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });
      // for trending
      let trending = await Feed.findOne({
        'content.pollId': content.pollId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    if (
                      trending.content.comments[j].reply[
                        k
                      ].likes.includes(req.user_id)
                    ) {
                      trending.content.comments[j].reply[
                        k
                      ].likes.splice(
                        trending.content.comments[j].reply[
                          k
                        ].likes.indexOf(req.user_id),
                        1,
                      );
                    } else {
                      trending.content.comments[j].reply[
                        k
                      ].likes.push(req.user_id);
                    }
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              if (
                trending.content.comments[j].likes.includes(
                  req.user_id,
                )
              ) {
                trending.content.comments[j].likes.splice(
                  trending.content.comments[j].likes.indexOf(
                    req.user_id,
                  ),
                  1,
                );
              } else {
                trending.content.comments[j].likes.push(req.user_id);
              }
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('polls');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();
        res.send('success');
      }
    }
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

/**
 * @swagger
 * /user/uploadStreamLink:
 *   post:
 *     summary: Upload Stream Link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  url:
 *                      type: string
 *                  image:
 *                      type: string
 *     responses:
 *       200:
 *         description: Stream Link Updated Successfullu
 *       500:
 *         description: Some server error
 */

router.post('/commentdelete', userMiddleware, async (req, res) => {
  try {
    const { user_data_id, content, comment, replyTo } = req.body;
    let user = await User.findOne({ _id: user_data_id });

    if (content.videoId) {
      let obj = user.videos.find((video, i) => {
        if (video.videoId == content.videoId) {
          if (user.videos[i].comments) {
            return user.videos[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.videos[i].comments[j].reply) {
                  return user.videos[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        user.videos[i].comments[j].reply.splice(k, 1);
                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  user.videos[i].comments.splice(j, 1);
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });
      // for trending
      let trending = await Feed.findOne({
        'content.videoId': content.videoId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    trending.content.comments[j].reply.splice(k, 1);
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              trending.content.comments.splice(j, 1);
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('videos');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();

        res.send('success');
      }
    } else if (content.trackId) {
      let obj = user.tracks.find((track, i) => {
        if (track.trackId == content.trackId) {
          if (user.tracks[i].comments) {
            return user.tracks[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.tracks[i].comments[j].reply) {
                  return user.tracks[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        user.tracks[i].comments[j].reply.splice(k, 1);
                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  user.tracks[i].comments.splice(j, 1);
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });

      // for trending
      let trending = await Feed.findOne({
        'content.trackId': content.trackId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    trending.content.comments[j].reply.splice(k, 1);
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              trending.content.comments.splice(j, 1);
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('tracks');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();
        res.send('success');
      }
    } else if (content.announcement) {
      let obj = user.posts.find((post, i) => {
        if (post.postId == content.postId) {
          if (user.posts[i].comments) {
            return user.posts[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.posts[i].comments[j].reply) {
                  return user.posts[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        user.posts[i].comments[j].reply.splice(k, 1);
                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  user.posts[i].comments.splice(j, 1);
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });
      // for trending
      let trending = await Feed.findOne({
        // user_id: user_data_id,
        'content.postId': content.postId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    trending.content.comments[j].reply.splice(k, 1);
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              trending.content.comments.splice(j, 1);
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('posts');
        await user.save();
        // trending
        await trending.markModified('content.comments');
        await trending.save();
        res.send('success');
      }
    } else if (content.pollId) {
      let obj = user.polls.find((poll, i) => {
        if (poll.pollId == content.pollId) {
          if (user.polls[i].comments) {
            return user.polls[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.polls[i].comments[j].reply) {
                  return user.polls[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        user.polls[i].comments[j].reply.splice(k, 1);
                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  user.polls[i].comments.splice(j, 1);
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });
      // for trending
      let trending = await Feed.findOne({
        'content.pollId': content.pollId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    trending.content.comments[j].reply.splice(k, 1);
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              trending.content.comments.splice(j, 1);
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('polls');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();
        res.send('success');
      }
    }
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

router.post('/commentedit', userMiddleware, async (req, res) => {
  try {
    const { user_data_id, content, comment, replyTo, newText } =
      req.body;
    let user = await User.findOne({ _id: user_data_id });

    if (content.videoId) {
      let obj = user.videos.find((video, i) => {
        if (video.videoId == content.videoId) {
          if (user.videos[i].comments) {
            return user.videos[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.videos[i].comments[j].reply) {
                  return user.videos[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        user.videos[i].comments[j].reply[k].comment =
                          newText;
                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  user.videos[i].comments[j].comment = newText;
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });
      // for trending
      let trending = await Feed.findOne({
        'content.videoId': content.videoId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    trending.content.comments[j].reply[k].comment =
                      newText;
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              trending.content.comments[j].comment = newText;
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('videos');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();

        res.send('success');
      }
    } else if (content.trackId) {
      let obj = user.tracks.find((track, i) => {
        if (track.trackId == content.trackId) {
          if (user.tracks[i].comments) {
            return user.tracks[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.tracks[i].comments[j].reply) {
                  return user.tracks[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        user.tracks[i].comments[j].reply[k].comment =
                          newText;
                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  user.tracks[i].comments[j].comment = newText;
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });

      // for trending
      let trending = await Feed.findOne({
        'content.trackId': content.trackId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    trending.content.comments[j].reply[k].comment =
                      newText;
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              trending.content.comments[j].comment = newText;
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('tracks');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();
        res.send('success');
      }
    } else if (content.announcement) {
      let obj = user.posts.find((post, i) => {
        if (post.postId == content.postId) {
          if (user.posts[i].comments) {
            return user.posts[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.posts[i].comments[j].reply) {
                  return user.posts[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        user.posts[i].comments[j].reply[k].comment =
                          newText;
                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  user.posts[i].comments[j].comment = newText;
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });
      // for trending
      let trending = await Feed.findOne({
        // user_id: user_data_id,
        'content.postId': content.postId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    trending.content.comments[j].reply[k].comment =
                      newText;
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              trending.content.comments[j].comment = newText;
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('posts');
        await user.save();
        // trending
        await trending.markModified('content.comments');
        await trending.save();
        res.send('success');
      }
    } else if (content.pollId) {
      let obj = user.polls.find((poll, i) => {
        if (poll.pollId == content.pollId) {
          if (user.polls[i].comments) {
            return user.polls[i].comments.find((c, j) => {
              if (replyTo && c._id == replyTo) {
                if (user.polls[i].comments[j].reply) {
                  return user.polls[i].comments[j].reply.find(
                    (re, k) => {
                      if (comment._id == re._id) {
                        user.polls[i].comments[j].reply[k].comment =
                          newText;
                        return true;
                      }
                    },
                  );
                }
              } else {
                if (comment._id == c._id) {
                  user.polls[i].comments[j].comment = newText;
                  return true;
                }
              }
            });
          }

          return true; // stop searching
        }
      });
      // for trending
      let trending = await Feed.findOne({
        'content.pollId': content.pollId,
      });
      if (trending && trending.content.comments) {
        trending.content.comments.find((c, j) => {
          if (replyTo && c._id == replyTo) {
            if (trending.content.comments[j].reply) {
              return trending.content.comments[j].reply.find(
                (re, k) => {
                  if (comment._id == re._id) {
                    trending.content.comments[j].reply[k].comment =
                      newText;
                    return true;
                  }
                },
              );
            }
          } else {
            if (comment._id == c._id) {
              trending.content.comments[j].comment = newText;
              return true;
            }
          }
        });
      }
      if (obj) {
        await user.markModified('polls');
        await user.save();

        // trending
        await trending.markModified('content.comments');
        await trending.save();
        res.send('success');
      }
    }
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

// For Uploading stream links
router.post('/uploadStreamLink', userMiddleware, async (req, res) => {
  try {
    let user = await User.findById(req.user_id);
    let { url, image } = req.body;
    if (url != '' && image != '' && user.streamLinks.length <= 4) {
      if (user.streamLinks) {
        user.streamLinks = [
          ...user.streamLinks,
          { id: Date.now(), url, image },
        ];
        await user.markModified('streamLinks');
      } else {
        user.streamLinks = [{ id: Date.now(), url, image }];
      }
      await user.save();
      res.status(201).send('Link Added');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
});

/**
 * @swagger
 * /user/deleteStreamLink:
 *   post:
 *     summary: Delete Stream Link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  url:
 *                      type: string
 *                  image:
 *                      type: string
 *                  id:
 *                      type: string
 *     responses:
 *       200:
 *         description: Stream Link Deleted Successfully
 *       500:
 *         description: Some server error
 */

// Delete Stream Link
router.post('/deleteStreamLink', userMiddleware, async (req, res) => {
  try {
    let user = await User.findById(req.user_id);
    let { id, url, image } = req.body;
    if (url != '' && image != '') {
      if (user.streamLinks) {
        user.streamLinks = user.streamLinks.filter(function (l) {
          return l.id !== id;
        });
        user.markModified('streamLinks');
      }
      await user.save();
      res.send('Link Removed');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
});

/**
 * @swagger
 * /user/streamDetails:
 *   post:
 *     summary: Add Stream Details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  name:
 *                      type: string
 *                  description:
 *                      type: string
 *                  category:
 *                      type: string
 *     responses:
 *       200:
 *         description: Stream details updated Successfullu
 *       500:
 *         description: Some server error
 */

// For Adding Stream Details
router.post('/streamDetails', userMiddleware, async (req, res) => {
  const { name, description, category } = req.body;
  if (name != '' && description != '') {
    User.findByIdAndUpdate(req.user_id, {
      streamDetails: { name, description, category },
    })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  } else {
    res.status(400).send({ msg: 'Enter valid input' });
  }
});

// Stream Schedule
router.post('/streamSchedule', userMiddleware, async (req, res) => {
  const { streamSchedule } = req.body;
  if (streamSchedule) {
    User.findByIdAndUpdate(req.user_id, {
      streamSchedule: streamSchedule,
    })
      .then((data) => {
        res.status(201).send('Scheduled The Stream');
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  } else {
    res.status(400).send({ msg: 'Enter valid input' });
  }
});

/**
 * @swagger
 * /user/disableComments:
 *   post:
 *     summary: Disabling video comments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              properties:
 *                  user_data_id:
 *                      type: string
 *                      default: 6232fb34ba083727b3879abb
 *                  value:
 *                      type: boolean
 *                      default: false
 *                  videId:
 *                      type: string
 *                      default: hgsacfW
 *     responses:
 *       200:
 *         description: Comments disabled successfully
 *       500:
 *         description: Some server error
 */

router.post('/disableComments', userMiddleware, async (req, res) => {
  try {
    const { videoId, value, user_data_id } = req.body;
    let user = await User.findOne({ _id: user_data_id });
    let obj = user.videos.find((video, i) => {
      if (video.videoId == videoId) {
        user.videos[i].disableComments = value;
        return true; // stop searching
      }
    });
    if (obj) {
      await user.markModified('videos');
      await user.save();
      res.status(201).send('success');
    }
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

/**
 * @swagger
 * /user/shortData/{id}:
 *  get:
 *      description: View all comments
 *      parameters:
 *        - in: path
 *          name: id
 *          description: Add user id
 *          schema:
 *              type: string
 *              default: 6232fb34ba083727b3879abb
 *      responses:
 *          200:
 *              description: Success
 */

router.get('/shortData/:id', (req, res) => {
  User.findById(req.params.id)
    .select({ username: 1, profile_image: 1, name: 1, email: 1 })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json('Error: ' + err));
});

/**
 * @swagger
 * /user/shortDataUsername/{username}:
 *  get:
 *      description: View all comments
 *      parameters:
 *        - in: path
 *          name: username
 *          description: Add username of the user
 *          schema:
 *              type: string
 *              default: mintie
 *      responses:
 *          200:
 *              description: Success
 */

router.get('/shortDataUsername/:username', (req, res) => {
  User.findOne({ username: req.params.username })
    .select({
      username: 1,
      profile_image: 1,
      name: 1,
      email: 1,
      id: 1,
    })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json('Error: ' + err));
});

// For adding poll

router.post('/addpoll', userMiddleware, (req, res) => {
  console.log(req.body);
  if (req.body.question && req.body.options) {
    let uid = makeid(7);
    var currentTimeInSeconds = Math.floor(Date.now() / 1000);
    let poll = {
      pollId: uid,
      question: req.body.question,
      options: req.body.options,
      tokenId: null,
      meta_url: null,
      time: currentTimeInSeconds,
      votes: [],
      likes: [],
      comments: [],
    };
    User.findByIdAndUpdate(req.user_id, { $push: { polls: poll } })
      .then(async (data) => {
        var trend = new Feed({
          user_id: data._id,
          wallet_id: data.wallet_id,
          username: data.username,
          name: data.name,
          profile_image: data.profile_image,
          superfan_data: data.superfan_data,
          content: poll,
          content_type: 'poll',
          reports: data.reports,
          superfan_to: data.superfan_to,
        });
        await trend.save();
        res.json(data);
      })
      .catch((err) => res.status(400).json('Error: ' + err));
  } else {
    res.status(400).send('Error');
  }
});

/*router.route("/:id").get((req, res) => {
  User.findById(req.params.id)
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id").delete((req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json("User Deleted"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/update/:id").post((req, res) => {
  User.findById(req.params.id)
    .then((user) => {
        user.wallet_id = req.body.walletId;

      user
        .save()
        .then(() => res.json("User Updated"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});*/

router.post(
  '/update_superfanplans',
  userMiddleware,
  async (req, res) => {
    try {
      const superfanData = req.body.superfanData;
      const user = await User.findById(req.user_id);
      User.findOneAndUpdate(
        { id: user.id },
        {
          $set: {
            superfan_data: superfanData,
          },
        },
        function (error, success) {
          if (error) {
            res.send(error);
          }
        },
      );
      Feed.updateMany(
        { username: user.username },
        {
          $set: {
            superfan_data: superfanData,
          },
        },
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
  },
);

/**
 * @swagger
 * /user/get_superfanplans/{username}:
 *  get:
 *      description: Get superfan plan data of the user
 *      parameters:
 *        - in: path
 *          name: username
 *          description: Add username of the user
 *          schema:
 *              type: string
 *              default: mintie
 *      responses:
 *          200:
 *              description: Success
 */

router.get('/get_superfanplans/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    if (user?.superfan_data && !user?.superfan_of) {
      let data = user.superfan_data;
      res.send({ data });
    } else if (user?.superfan_data && user?.superfan_of) {
      let data = user.superfan_data;
      user?.superfan_of.forEach((value) => {
        switch (value.plan) {
          case 'Basic':
            if (!data.subscribedToBasic) {
              data.subscribedToBasic = [];
            }
            data.subscribedToBasic.push(value.username);
            break;
          case 'Silver':
            if (!data.subscribedToSilver) {
              data.subscribedToSilver = [];
            }
            data.subscribedToSilver.push(value.username);
            break;
          case 'Gold':
            if (!data.subscribedToGold) {
              data.subscribedToGold = [];
            }
            data.subscribedToGold.push(value.username);
            break;
        }
      });
      res.send({ data });
    } else {
      res.send('Error getting plans');
    }
  } catch (err) {
    console.log(err);
  }
});

router.get('/:user/poll/:id', async (req, res) => {
  try {
    const username = req.params.user;
    const pollId = req.params.id;
    const u = await User.findOne({ username: username });
    let content = u.polls.filter((v) => {
      return v.pollId === pollId;
    });
    if (content[0]) {
      let totaldata = {
        user_id: u._id,
        wallet_id: u.wallet_id,
        username: u.username,
        name: u.name,
        profile_image: u.profile_image,
        superfan_data: u.superfan_data,
        content: content[0],
        content_type: 'poll',
        reports: u.reports,
        superfan_to: u.superfan_to,
      };
      res.json(totaldata);
    } else {
      res.status(404).send('poll not found');
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/conversations/:username', async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });
    if (!user) {
      return res.status(404).send('user not found');
    }
    res.send(user.conversations);
  } catch (err) {
    res.status(500).send('Something went wrong');
    console.log(err.message);
  }
});

/**
 * @swagger
 * /user/{username}/{type}/{id}:
 *  get:
 *      description: Get superfan plan data of the user
 *      parameters:
 *        - in: path
 *          name: username
 *          description: Add username of the user
 *          schema:
 *              type: string
 *              default: mintie
 *        - in: path
 *          name: type
 *          description: Add type (post, video, track, poll)
 *          schema:
 *              type: string
 *              default: post
 *        - in: path
 *          name: id
 *          description: Add id of the content
 *          schema:
 *              type: string
 *              default: jhbfj1
 *      responses:
 *          200:
 *              description: Success
 */

router.get('/:username/:type/:id', async (req, res) => {
  try {
    const username = req.params.username;
    const id = req.params.id;
    const type = req.params.type;
    const u = await User.findOne({ username: username });
    let content = null;
    switch (type) {
      case 'video':
        content = u.videos.filter((v) => {
          return v.videoId === id;
        });
        break;
      case 'track':
        content = u.tracks.filter((v) => {
          return v.trackId === id;
        });
        break;
      case 'post':
        content = u.posts.filter((v) => {
          return v.postId === id;
        });
        break;
      case 'poll':
        content = u.polls.filter((v) => {
          return v.pollId === id;
        });
        break;
      default:
        res.status(404).send('No Content Type found');
        return;
    }

    if (content[0]) {
      let totaldata = {
        user_id: u._id,
        wallet_id: u.wallet_id,
        username: u.username,
        name: u.name,
        profile_image: u.profile_image,
        superfan_data: u.superfan_data,
        content: content[0],
        content_type: type,
        reports: u.reports,
        superfan_to: u.superfan_to,
      };
      res.json(totaldata);
    } else {
      res.status(404).send(`${type} not found`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});




router.post('/addevent', userMiddleware, (req, res) => {
  console.log(req.body);
  if (req.body.title ) {
    let uid = makeid(7);
    var currentTimeInSeconds = Math.floor(Date.now() / 1000);
    let event = {
      eventId: uid,
      title: req.body.title,
      type: req.body.type,
      category: req.body.category,
      freeEvent: req.body.freeEvent,
      ticketPrice : req.body.ticketPrice,
      unlimitedTickets: req.body.unlimitedTickets,
      ticketCount : req.body.ticketCount,
      description: req.body.description,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      timeZone: req.body.timeZone,
      eventImage : req.body.eventImage,
      eventGallery: req.body.eventGallery,
      eventHost : req.body.eventHost,
      eventUrl : req.body.eventUrl,
      location: req.body.location,
      lockId: req.body.lockId, 
      time: currentTimeInSeconds, 
    };
    User.findByIdAndUpdate(req.user_id, { $push: { events: event } })
      .then(async (data) => {
        res.json(data);
        
      })
      .catch((err) => res.status(400).json('Error: ' + err));
  } else {
    res.status(400).send('Error');
  }
});


module.exports = router;
