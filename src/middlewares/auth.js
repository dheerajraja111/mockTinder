const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // Read the token from the cookie
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Unauthorized: Please login");
    }

    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

    // validate the token
    const { _id } = decodedObj;

    // Find the user
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

module.exports = { userAuth };
