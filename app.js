const express = require("express");
const app = express();

const authRoutes = require("./routes/auth_routes");
const authMiddleware = require("./middleware/auth");
const jobsRoutes = require("./routes/jobs_routes");
const notFound = require("./middleware/not-found");
const connectDB = require("./db/connect");
require("dotenv").config();

// build-in module
const path = require("path");

// extra security packages
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");

// middlewares
// set up express static (as first middleware) to serve static assets from client build
app.use(express.static(path.resolve(__dirname, "./client/build")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// other middlewares
app.use(helmet());
app.use(xss());

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", authMiddleware, jobsRoutes);
// serve index.html for all routes (apart from API)
// front-end routes pick it up form here
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

// custom global middleware (after all routes)
app.use(notFound);

// server will start only if we have successfully connected to DB
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.CONNECT_STRING);

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
