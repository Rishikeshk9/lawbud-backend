const express = require("express");
const user = require("./user.routes");
const router = express.Router();

const defaultRoutes = [
  {
    path: "/user",
    route: user,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
