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

const postSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instagram_User",
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
