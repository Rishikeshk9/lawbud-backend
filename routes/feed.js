const router = require('express').Router();

let Feed = require('../models/feed.model');
let User = require('../models/user.model');

router.route('/').get((req, res) => {
  const skip = req.query.skip ? parseInt(req.query.skip) : 0;
  const LIMIT = 10;
  Feed.find({})
    .sort({ _id: -1 })
    .skip(skip)
    .limit(LIMIT)
    .then((feed) => res.json(feed))
    .catch((err) => res.status(400).json('Error: ' + err));
});

function dateIsValid(date) {
  return date instanceof Date && !isNaN(date);
}

router.get('/:username', async (req, res) => {
  const username = req.params.username;
  let feeds = [];
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      if (user.videos) {
        user.videos.map((v) => {
          feeds.push({
            user_id: user._id,
            wallet_id: user.wallet_id,
            username: user.username,
            name: user.name,
            profile_image: user.profile_image,
            superfan_data: user.superfan_data,
            content: v,
            content_type: 'video',
            reports: user.reports,
            superfan_to: user.superfan_to,
          });
        });
      }
      if (user.tracks) {
        user.tracks.map((v) => {
          feeds.push({
            user_id: user._id,
            wallet_id: user.wallet_id,
            username: user.username,
            name: user.name,
            profile_image: user.profile_image,
            superfan_data: user.superfan_data,
            content: v,
            content_type: 'track',
            reports: user.reports,
            superfan_to: user.superfan_to,
          });
        });
      }
      if (user.posts) {
        user.posts.map((v) => {
          feeds.push({
            user_id: user._id,
            wallet_id: user.wallet_id,
            username: user.username,
            name: user.name,
            profile_image: user.profile_image,
            superfan_data: user.superfan_data,
            content: v,
            content_type: 'post',
            reports: user.reports,
            superfan_to: user.superfan_to,
          });
        });
      }
      if (user.polls) {
        user.polls.map((v) => {
          feeds.push({
            user_id: user._id,
            wallet_id: user.wallet_id,
            username: user.username,
            name: user.name,
            profile_image: user.profile_image,
            superfan_data: user.superfan_data,
            content: v,
            content_type: 'poll',
            reports: user.reports,
            superfan_to: user.superfan_to,
          });
        });
      }
      feeds.sort((a, b) => {
        let da = new Date(a.content.time * 1);
        let db = new Date(b.content.time * 1);
        if (dateIsValid(da) && dateIsValid(db)) {
          return db - da;
        }else{
          return -1;
        }
      });
      res.send(feeds);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
