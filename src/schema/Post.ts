import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
  comment: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instagram_User",
  },
});

const likeSchema = new mongoose.Schema({
  likedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instagram_User",
  },
});

const userSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instagram_User",
  },
  name: {
    type: String,
  },
});

const postSchema = new Schema({
  user: {
    type: userSchema,
    required: true,
  },
  image: {
    type: Buffer,
    required: true,
  },
  description: {
    type: String,
  },
  likes: {
    type: [likeSchema],
    default: [],
  },
  comments: {
    type: [commentSchema],
    default: [],
  },
});

postSchema.path("image").validate((value) => {
  if (value && value.length / (1024 * 1024) > 5) {
    throw new Error("Image size must not exceed 5 MB");
  }
});

export default mongoose.model("User_Posts", postSchema);
