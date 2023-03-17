const express = require("express");
const user = require("./user.routes");
const specialisation = require("./specialisation.routes");
const email = require("./email.routes");
const router = express.Router();

const defaultRoutes = [
  {
    path: "/user",
    route: user,
  },
  {
    path: "/specialisation",
    route: specialisation,
  },
  {
    path: "/email",
    route: email,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
