const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const mongo = require("mongodb");
const ObjectId = mongo.ObjectId;
const dbs = require("../database/database");

// LEADING TO HOME PAGE (fetch posts for homepage)
router.get('/', async function (req, res) {
  try {
    const posts = await dbs.getdb().collection("tech_info").find({}).project({ content: 0 }).toArray();
    res.render('index', { data: posts }); // Display posts in homepage
  } catch (error) {
    console.error("Error rendering posts:", error);
    res.status(500).render('500');
  }
});

// View All Posts
router.get('/posts', async function (req, res) {
  try {
    const posts = await dbs.getdb().collection("tech_info").find({}).project({ content: 0 }).toArray();
    res.render('posts', { data: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).render('500');
  }
});

// Create a New Post
router.get('/new-post', async function (req, res) {
  res.render('create-post');
});

// Submit a New Post
router.post("/forms", async function (req, res) {
  const db = dbs.getdb();
  const data = req.body;
  data.user_email = req.session.user_mail;

  try {
    const handlingDate = new Date();
    data.date = handlingDate.toLocaleDateString('en-US', {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Insert post into the collection
    await db.collection("tech_info").insertOne(data);
    res.redirect("/");
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).render('500');
  }
});

// View a Single Post
router.get("/view/:id", async function (req, res) {
  const id = req.params.id;
  try {
    const post = await dbs.getdb().collection("tech_info").findOne({ _id: new ObjectId(id) });
    if (!post) return res.status(404).render('404');
    res.render("post-detail", { data: post });
  } catch (error) {
    console.error("Error fetching post details:", error);
    res.status(500).render('500');
  }
});

// Edit Post Page
router.get("/edit/:id", async function (req, res) {
  const id = req.params.id;
  try {
    const post = await dbs.getdb().collection("tech_info").findOne({ _id: new ObjectId(id) });
    if (!post) return res.status(404).render('404');
    res.render("update-post", { id });
  } catch (error) {
    console.error("Error fetching post for editing:", error);
    res.status(500).render('500');
  }
});

// Update Post
router.post("/edit/:id/forms", async function (req, res) {
  const id = req.params.id;
  const data = req.body;

  try {
    await dbs.getdb().collection("tech_info").updateOne(
      { _id: new ObjectId(id) },
      { $set: { title: data.title, summary: data.summary, content: data.content } }
    );
    res.redirect("/");
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).render('500');
  }
});

// Delete Post
router.post("/delete/:id", async function (req, res) {
  const id = req.params.id;
  try {
    await dbs.getdb().collection("tech_info").deleteOne({ _id: new ObjectId(id) });
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).render('500');
  }
});

// Fetch Comments
router.get("/comments/:id", async function (req, res) {
  const id = req.params.id;
  try {
    const comments = await dbs.getdb().collection("comments").find({ tech_id: id }).toArray();
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send("Error fetching comments");
  }
});

// Store Comment
router.post("/comment/:id/store", async function (req, res) {
  const id = req.params.id;
  const data = req.body;
  data.tech_id = id;

  try {
    await dbs.getdb().collection("comments").insertOne(data);
    res.json({ message: "Comment added successfully!" });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send("Error adding comment");
  }
});

// Sign Up
router.get("/signup", (req, res) => {
  res.render('signup', { inputdata: req.session.sign_up || {} });
});

router.post('/signup', async function (req, res) {
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  const { email, confirm_email } = req.body;
  
  const userExists = await dbs.getdb().collection("user_auth_data").findOne({ email });
  if (userExists || email !== confirm_email || req.body.password.length < 6) {
    req.session.sign_up = { email, confirm_email, hasError: true };
    return res.redirect("/signup");
  }

  await dbs.getdb().collection("user_auth_data").insertOne({ email, password: hashedPassword });
  res.redirect("/login");
});

// Log In
router.get("/login", (req, res) => {
  res.render('login', { data: req.session.login_error || {} });
});

router.post('/login', async function (req, res) {
  const { email, password } = req.body;
  const user = await dbs.getdb().collection("user_auth_data").findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.redirect("/login");
  }

  req.session.user = { email: user.email, id: user._id };
  req.session.isAuthenticated = true;
  res.redirect("/");
});

// Log Out
router.get("/logout", (req, res) => {
  req.session.isAuthenticated = false;
  res.redirect("/");
});

module.exports = router;
