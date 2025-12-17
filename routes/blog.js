const { Router } = require("express");

const multer = require("multer");
const router = Router();
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

// Edit form (owner only)
router.get('/:id/edit', async (req, res) => {
  if (!req.user) {
    return res.redirect('/user/signin');
  }
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.redirect('/');
  if (String(blog.createdBy) !== String(req.user._id)) {
    return res.redirect(`/blog/${req.params.id}`);
  }
  return res.render('editBlog', { user: req.user, blog });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  // Normalize creator avatar paths so /public/default.jpg becomes /default.jpg for static serving
  if (blog?.createdBy) {
    const currentUrl = blog.createdBy.profileImageURL;
    if (currentUrl?.startsWith("/public/")) {
      blog.createdBy.profileImageURL = currentUrl.replace("/public/", "/");
    }
    if (!blog.createdBy.profileImageURL) {
      blog.createdBy.profileImageURL = "/default.jpg";
    }
  }
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  // Normalize all comment creator avatars
  if (comments?.length > 0) {
    comments.forEach((comment) => {
      if (comment?.createdBy) {
        const currentUrl = comment.createdBy.profileImageURL;
        if (currentUrl?.startsWith("/public/")) {
          comment.createdBy.profileImageURL = currentUrl.replace(
            "/public/",
            "/"
          );
        }
        if (!comment.createdBy.profileImageURL) {
          comment.createdBy.profileImageURL = "/default.jpg";
        }
      }
    });
  }
  console.log("blog", blog);
  console.log("comments", comments);
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

// Update blog (owner only; cover image optional)
router.post('/:id/edit', upload.single('coverImage'), async (req, res) => {
  if (!req.user) {
    return res.status(401).redirect('/user/signin');
  }
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).redirect('/');
  if (String(blog.createdBy) !== String(req.user._id)) {
    return res.status(403).redirect(`/blog/${req.params.id}`);
  }

  const updates = {
    title: req.body.title,
    body: req.body.body,
  };
  if (req.file) {
    updates.coverImageURL = `/uploads/${req.file.filename}`;
  }

  await Blog.findByIdAndUpdate(req.params.id, updates, { new: true });
  return res.redirect(`/blog/${req.params.id}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});
  // Delete a blog (owner only)
  router.post('/:id/delete', async (req, res) => {
    if (!req.user) {
      return res.status(401).redirect('/user/signin');
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).redirect('/');
    }

    if (String(blog.createdBy) !== String(req.user._id)) {
      return res.status(403).redirect(`/blog/${req.params.id}`);
    }

    await Comment.deleteMany({ blogId: req.params.id });
    await Blog.findByIdAndDelete(req.params.id);

    return res.redirect('/');
  })

module.exports = router;
