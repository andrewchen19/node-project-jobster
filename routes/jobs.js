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

router.get("/", getAllJobs);
router.get("/:_id", getJob);
router.post("/", createJob);
router.patch("/:_id", updateJob);
router.delete("/:_id", deleteJob);
router.route("/stats").get(showStats);

module.exports = router;
