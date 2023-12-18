const Joi = require("joi");

// 當有人要註冊我們系統的話，，必須先通過此驗證
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(50).messages({
      "any.required": "Name must be provided",
      "string.empty": "Name cannot be empty",
      "string.min": "Name should have a minimum length of {#limit} characters",
      "string.max": "Name should have a maximum length of {#limit} characters",
    }),
    // email() -> 必須是有效的 email 格式
    email: Joi.string().email().required().messages({
      "any.required": "Email must be provided",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
    password: Joi.string().required().min(5).max(50).messages({
      "any.required": "Password must be provided",
      "string.empty": "Password cannot be empty",
      "string.min":
        "Password should have a minimum length of {#limit} characters",
      "string.max":
        "Password should have a maximum length of {#limit} characters",
    }),
    lastName: Joi.string().required().max(20).default("lastName").messages({
      "any.required": "LastName must be provided",
      "string.max":
        "LastName should have a maximum length of {#limit} characters",
    }),
    location: Joi.string().required().max(20).default("my city").messages({
      "any.required": "Location must be provided",
      "string.max":
        "Location should have a maximum length of {#limit} characters",
    }),
  });

  return schema.validate(data);
};

// 當有人要登入我們系統的話，，必須先通過此驗證
// 這邊的 password 不用限定字數 (只是登入而已)
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email must be provided",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password must be provided",
      "string.empty": "Password cannot be empty",
    }),
  });

  return schema.validate(data);
};

// 當使用者要新增 or 更新 or 刪除工作時，必須先通過此驗證
const jobValidation = (data) => {
  const schema = Joi.object({
    company: Joi.string().max(50).required().messages({
      "any.required": "Company name must be provided",
      "string.empty": "Company name cannot be empty",
      "string.max":
        "Company name should have a maximum length of {#limit} characters",
    }),
    position: Joi.string().max(100).required().messages({
      "any.required": "Position must be provided",
      "string.empty": "Position cannot be empty",
      "string.max":
        "Position should have a maximum length of {#limit} characters",
    }),
    // valid() -> 代表只能從中選取
    status: Joi.string()
      .valid("interview", "declined", "pending")
      .default("pending")
      .messages({
        "any.only": "Status must be one of: interview, declined, pending",
      }),
    jobType: Joi.string()
      .valid("full-time", "part-time", "remote", "internship")
      .default("full-time")
      .messages({
        "any.only":
          "Job type must be one of: full-time, part-time, remote, internship",
      }),
    jobLocation: Joi.string().default("my city").messages({
      "string.empty": "Job location cannot be empty",
    }),
  });

  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  jobValidation,
};
