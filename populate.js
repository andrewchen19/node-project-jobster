// add exist data from [Mockaroo](https://www.mockaroo.com/)
// we have to connect DB one more time (指令 -> node .\populate.js)

const Job = require("./models/Job");
const mockData = require("./mock-data.json");

const connectDB = require("./db/connect");
require("dotenv").config();

const start = async () => {
  try {
    await connectDB(process.env.CONNECT_STRING);
    // 加入 exist data
    // mockData -> array of objects
    await Job.create(mockData);
    console.log("Success!!!");
    // terminate the process // 0 -> success code
    process.exit(0);
  } catch (err) {
    console.log(err);
    // terminate the process // 1 -> failure code
    process.exit(1);
  }
};

start();
