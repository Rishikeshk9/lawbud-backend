const router = require('express').Router();
const Str = require('@supercharge/strings');

let User = require('../models/user.model');

router.route('/').get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => { 
  const fullName = req.body.name;
  const phone = req.body.phone;
  const mail = req.body.mail;
  const altPhone = req.body.altPhone;
  const address = req.body.address;
  const specialization = req.body.specialization;
  const degree = req.files.degree;
  const bar = req.files.bar;
  const sanatNumber = req.body.sanatNumber;
  const experience = req.body.experience;
  const profile_image = req.body.profile_image;
  
  const userId = Str.random(5);

  const newUser = new User({
    userId: userId,
    fullName: fullName,
    phone: phone,
    mail: mail,
    altPhone: altPhone,
    address: address,
    specialization: specialization,
    degree: degree,
    bar: bar,
    experience: experience,
    sanatNumber: sanatNumber, 
     
  });

  newUser
    .save()
    .then(() => res.json('User added!'))
    .catch((err) => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  User.findById(req.params.id)
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json('User Deleted'))
    .catch((err) => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post((req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      user.wallet_id = req.body.walletId;

      user
        .save()
        .then(() => res.json('User Updated'))
        .catch((err) => res.status(400).json('Error: ' + err));
    })
    .catch((err) => res.status(400).json('Error: ' + err));
});

// router.route("/referred-by/:username").post((req, res) => {
//   User.findById(req.params.username)
//     .then((user) => {
//         user.wallet_id = req.body.walletId;

//       user
//         .save()
//         .then(() => res.json("User Updated"))
//         .catch((err) => res.status(400).json("Error: " + err));
//     })
//     .catch((err) => res.status(400).json("Error: " + err));
// });
module.exports = router;
