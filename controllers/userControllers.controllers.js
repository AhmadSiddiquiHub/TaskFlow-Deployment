const User = require("../models/userSchema.models");

//  Register Controller
const registerController = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    if (!name || !email || !password || !phoneNumber) {
      res.status(400);
      throw new Error("Plz fill all the fields!");
    }
    const existedUser = await User.findOne({ email });

    if (existedUser) {
      res.status(302);
      throw new Error("User already existed!");
    }

    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
    });

    if (!user) {
      res.status(500);
      throw new Error("User Registration Failed!");
    }

    return res.json({
      msg: "User Registered Successfully!",
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login Controller
const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Plz fill all the fields!");
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("User not Found!");
    }

    const passwordMatched = await user.comparePassword(password);

    if (!passwordMatched) {
      res.status(401);
      throw new Error("Invalid Credentials!");
    }
    const token = await user.generateAuthToken();

    return res.json({
      msg: "User Logged In Successfully!",
      user: {
        token,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const id = req.user;
    const user = await User.findById(id).select("-password");
    return res.json({ user });
    // return res.json({ msg: "Current User" });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

module.exports = { registerController, loginController, getCurrentUser };
