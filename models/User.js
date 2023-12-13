const mongoose = require("mongoose");
const { Schema } = mongoose;

const bcrypt = require("bcrypt");

// schema 的部分
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name must be provided"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Email must be provided"],
    // 必須是有效的 email 格式
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Password must be provided"],
    minlength: 5,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: [true, "LastName must be provided"],
    maxlength: 20,
    default: "lastName",
  },
  location: {
    type: String,
    required: [true, "Location must be provided"],
    maxlength: 20,
    default: "my city",
  },
});

// Mongoose Middleware
// 當定義在 Schema 上 ，allows you to use the same logic for all documents of the model
// 第二個參數 -> function expression (才能使用 this 關鍵字)
userSchema.pre("save", async function (next) {
  // this 指向正在進行儲存的用戶資料，也就是一個 Mongoose document
  if (this.isNew || this.isModified("password")) {
    // 第二個參數 -> saltRounds
    let hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

// Instance Method
// 若我們希望某個 Model 所建立的實例 ( instance，也就是 document ) 都可以使用某個 method 時，可以將 method 定義在 Schema 上
userSchema.methods.comparePassword = async function (candidatePassword) {
  // 第二個參數是指 instance 儲存在資料庫的雜湊值
  const isMatch = await bcrypt.compare(candidatePassword, this.password);

  return isMatch;
};

// model 的部分
const User = mongoose.model("User", userSchema);

module.exports = User;
