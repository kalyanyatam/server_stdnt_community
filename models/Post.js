import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    imgUrl: { type: String },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    username: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now } 
});

const PostModel = mongoose.model("Post", PostSchema);

export { PostModel as Post };
