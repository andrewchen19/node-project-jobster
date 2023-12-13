// custom local middleware

const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const authHeaders = req.headers.authorization;
  // console.log(req.headers);

  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    // unAuthorized
    return res.status(401).json({ msg: "No token provided" });
  }

  // String.spilt() return array
  const token = req.headers.authorization.split(" ")[1];
  // console.log(token);

  // verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // iat (Issued At) -> indicating the time at which the token was created
    // exp (Expiration Time) -> indicating when the token will expire
    // console.log(decoded);

    const { userId, userName } = decoded;
    const demoUser = userId === "65786101419c3d7e189006dc";

    // set up user property with object values
    req.user = { userId, userName, demoUser };

    next();
  } catch (error) {
    // token maybe expired
    return res.status(401).json({ msg: "Not authorized to this route" });
  }
};

module.exports = authMiddleware;
