const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'blog-platform';
const client = new MongoClient(uri);

// Middleware to check if the user is an admin
function checkAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    return res.status(403).send('Access denied. Admins only.');
  }
  next();
}

// Admin Dashboard
router.get('/dashboard', checkAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const postsCollection = db.collection('posts');
    const posts = await postsCollection.find().toArray();

    res.render('admin-dashboard', { posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
