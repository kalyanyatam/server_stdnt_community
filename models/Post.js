import express from 'express';
import multer from 'multer';
import path from 'path';
import { Post } from '../models/Post.js';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Create post with image
router.post('/createposts', upload.single('image'), async (req, res) => {
  try {
    const { title, desc, username } = req.body;
    const imgUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newPost = new Post({
      imgUrl,
      title,
      desc,
      username
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
