const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
  const token = req.headers["authorization"];
  const jwtToken = token?.split(" ")[1];

  if (!jwtToken) {
    return res.send({ msg: "Unauthorized HTTP, Token not Provided!" });
  }

  try {
    const decoded = await jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

    req.user = decoded._id;

    next();
  } catch (error) {
    return res.json({ msg: "Invalid Token" });
  }
};

module.exports = { authentication };
