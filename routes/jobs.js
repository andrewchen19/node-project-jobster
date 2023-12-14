const express = require("express");
const router = express.Router();

const {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
} = require("../controllers/jobs");

router.route("/").get(getAllJobs).post(createJob);
router.route("/stats").get(showStats);
router.route("/:_id").get(getJob).patch(updateJob).delete(deleteJob);

module.exports = router;
