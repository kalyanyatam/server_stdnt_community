import express from "express";
import { Post } from "../models/Post.js";
import {verifyUser} from './user.js'
const router = express.Router();


router.post("/createposts", verifyUser, async (req, res) => {
  try {
    const { imgUrl, title, desc } = req.body;
    const post = new Post({
      imgUrl,
      title,
      desc,
      username: req.user.username, 
      createdAt: new Date()
    });
    await post.save();
    res.status(201).json({ status: true, message: "Post created successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to create post", error: error.message });
  }
});

// Get Posts route
router.get("/getposts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json({ status: true, posts });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to retrieve posts", error: error.message });
  }
});
//deletes the post only by author of that post
router.delete('/deletepost/:id', verifyUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const user = req.user; 

   
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

   
    if (post.username !== user.username) {
      return res.status(403).json({ status: false, message: 'Unauthorized to delete this post' });
    }

   
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ status: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Failed to delete post', error: error.message });
  }
});

export { router as PostRouter };
