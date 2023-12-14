const Job = require("../models/Job");
const { jobValidation } = require("../validation");

const mongoose = require("mongoose");
const dayjs = require("dayjs");

const getAllJobs = async (req, res) => {
  try {
    const { status, jobType, sort, search } = req.query;

    // protected routes (User 只能看到自己所創建的資料)
    const queryObject = {
      createdBy: req.user.userId,
    };

    if (search) {
      // $regex -> Selects documents where values match a specified regular expression (使用者不用輸入完整的名字)
      // $options: 'i' -> Case insensitivity to match upper and lower cases
      queryObject.position = { $regex: search, $options: "i" };
    }

    if (status && status !== "all") {
      queryObject.status = status;
    }

    if (jobType && jobType !== "all") {
      queryObject.jobType = jobType;
    }

    // thenable object // 提供 method chaining (記得把 await 拿掉)
    let result = Job.find(queryObject);

    // sort()
    if (sort) {
      if (sort === "latest") {
        result = result.sort("-createdAt");
      }
      if (sort === "oldest") {
        result = result.sort("createdAt");
      }
      if (sort === "a-z") {
        result = result.sort("position");
      }
      if (sort === "z-a") {
        result = result.sort("-position");
      }
    }

    // limit() & skip() -> use for pagination functionality
    // query string 的 type 都是 String (記得轉換 type)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    result = result.skip(skip).limit(limit);

    // get the data
    const jobs = await result;
    // get the total jobs (number) base on the query
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / limit);

    res.status(200).json({ jobs, totalJobs, numOfPages });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const getJob = async (req, res) => {
  try {
    const { _id } = req.params;
    // 沒找到特定的資料時， return null
    const job = await Job.findOne(req.params);

    if (!job) {
      // Not Found
      return res.status(404).json({ msg: `No job with id: ${_id}` });
    }

    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const createJob = async (req, res) => {
  // 檢查是否為 demoUser
  if (req.user.demoUser) {
    // Bad Request
    return res.status(400).json({ msg: "Demo User. Read only!" });
  }

  // 檢查每個欄位是否格式都正確
  const { error } = jobValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // 儲存時，記得加上，透過 local middleware 儲存在 req.user 裡面的 userId
    const job = await Job.create({ ...req.body, createdBy: req.user.userId });

    // Created
    res.status(201).json({ job });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const updateJob = async (req, res) => {
  // 檢查是否為 demoUser
  if (req.user.demoUser) {
    // Bad Request
    return res.status(400).json({ msg: "Demo User. Read only!" });
  }

  // 檢查每個欄位是否格式都正確
  const { error } = jobValidation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { _id } = req.params;

    // 沒找到特定的資料時， return null
    const job = await Job.findOneAndUpdate(req.params, req.body, {
      runValidators: true,
      new: true,
    });

    if (!job) {
      // Not Found
      return res.status(404).json({ msg: `No job with id: ${_id}` });
    }

    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const deleteJob = async (req, res) => {
  // 檢查是否為 demoUser
  if (req.user.demoUser) {
    // Bad Request
    return res.status(400).json({ msg: "Demo User. Read only!" });
  }

  try {
    const { _id } = req.params;

    // 沒找到特定的資料時， return null
    const job = await Job.findOneAndDelete(req.params);

    if (!job) {
      // Not Found
      return res.status(404).json({ msg: `No job with id: ${_id}` });
    }

    res.status(200).json({ msg: "Delete Successful" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const showStats = async (req, res) => {
  // aggregation pipeline
  let stats = await Job.aggregate([
    // Step 1：Filter Job collection's documents by createdBy
    // we need mongoose object (not just general string)
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    // Step 2：Group remaining documents by status and calculate total quantity
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  console.log(stats);

  // reduce() -> return the sum of all the elements in an array
  stats = stats.reduce((total, item) => {
    // total 一開始是 initialValue -> {}
    const { _id: title, count } = item;

    total[title] = count;

    return total;
  }, {});
  console.log(stats);

  const defaultStats = {
    interview: stats.interview || 0,
    pending: stats.pending || 0,
    declined: stats.declined || 0,
  };

  // aggregation pipeline
  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    // Step 3：Sort documents by year & month in descending order (降序，由大到小)
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    // Step 4：limit the number of documents we want
    { $limit: 6 },
  ]);
  console.log(monthlyApplications);

  monthlyApplications = monthlyApplications.map((item) => {
    const {
      _id: { year, month },
      count,
    } = item;

    const date = dayjs(`${year}-${month}-01`).format("MMM YYYY");

    return { date, count };
  });
  console.log(monthlyApplications);

  monthlyApplications = monthlyApplications.reverse();

  res.status(200).json({ defaultStats, monthlyApplications });
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
};
