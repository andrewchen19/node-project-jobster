const User = require("../models/User");
const { registerValidation, loginValidation } = require("../validation");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = registerValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // 檢查 DB 裡面是否有重複註冊的 email
  const foundUser = await User.findOne({ email: req.body.email });

  if (foundUser) {
    // Conflict
    return res.status(409).json({ error: "Email is already registered" });
  }

  try {
    // 儲存前，會先進到 Mongoose Middleware
    const user = await User.create(req.body);
    // Created
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ msg: "Unable to store user data" });
  }
};

const login = async (req, res) => {
  // 檢查每個欄位是否格式都正確
  const { error } = loginValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // 檢查是否有此用戶
  const foundUser = await User.findOne({ email: req.body.email });

  if (!foundUser) {
    // Not Found
    return res.status(404).json({
      msg: "User not found, please double-check the email for accuracy",
    });
  }

  // Instance Method (比對輸入的密碼是否與儲存的雜湊值相同)
  const result = await foundUser.comparePassword(req.body.password);

  // result 為 false，代表比對結果不相同
  if (!result) {
    // Unauthorized
    return res
      .status(401)
      .json({ msg: "Password incorrect. Please double-check the password" });
  }

  // 比對結果相同後 (result 為 true)，製作 token 並傳回給使用者
  const token = jwt.sign(
    { userId: foundUser._id, userName: foundUser.name },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  res.status(200).json({
    msg: "Login Successful",
    user: {
      name: foundUser.name,
      email: foundUser.email,
      lastName: foundUser.lastName,
      location: foundUser.location,
      token,
    },
  });
};

const updateUser = async (req, res) => {
  const { name, email, lastName, location } = req.body;

  // 檢查是否為 demoUser
  if (req.user.demoUser) {
    // Bad Request
    return res.status(400).json({ msg: "Demo User. Read only!" });
  }

  // 檢查是否有欄位沒有填寫
  if (!name || !email || !lastName || !location) {
    // Bad Request
    return res.status(400).json({ msg: "Please provide all values" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.userId },
      { name, email, lastName, location },
      {
        runValidators: true,
        new: true,
      }
    );

    // 製作新的 token 並傳回給使用者 (因為 userName 有可能會更新)
    const token = jwt.sign(
      { userId: user._id, userName: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        lastName: user.lastName,
        location: user.location,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

module.exports = { register, login, updateUser };
