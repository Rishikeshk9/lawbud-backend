const jwt = require("jsonwebtoken");

const userAuthentication = (req, res, next) => {
  // Get the user from the jwt token and add id to req object
  const JWT_SECRET = process.env.JWT_SECRET;
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({
      errors: [{ msg: "Please authenticate using a valid token" }],
    });
    return;
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user_id = data.user_id;
    next();
  } catch (error) {
    res.status(401).send({
      errors: [{ msg: "Please authenticate using a valid token" }],
    });
  }
};
module.exports = userAuthentication;
