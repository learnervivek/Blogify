require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const util = require("util");

const Blog = require("./models/blog");

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const app = express();
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URL)
  .then((e) => console.log("MongoDB connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Parse JSON and URL-encoded form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

// Central error handler to avoid opaque [object Object] responses
app.use((err, req, res, next) => {
  console.error("Unhandled error:", util.inspect(err, { depth: 4 }));
  const message = err?.message || "Something went wrong";

  // If avatar/profile update fails, render the profile page with the error
  if (req.originalUrl.startsWith("/user/profile")) {
    return res.status(500).render("profile", {
      user: req.user || {},
      success: null,
      error: message,
    });
  }

  return res.status(500).send(message);
});

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
