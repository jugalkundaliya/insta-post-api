import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User, { IUserData } from "./schema/User";
dotenv.config();
const cors = require("cors");
const multer = require("multer");

import "./server";
import Post from "./schema/Post";
import { authorize } from "./middleware/auth";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const app: Express = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

app.get("/", async (req: Request, res: Response) => {
  res.send("Init request success");
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      const userToAdd = new User({
        email,
        password: bcrypt.hashSync(password, 10),
      });
      await userToAdd.save();
      sendNewToken(userToAdd, res);
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendNewToken(user, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.post(
  "/posts",
  authorize,
  upload.single("file"),
  async (req: any, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    try {
      const { description } = req.body;
      const userId = (req as any).userId;
      const name = (await User.findById(userId))?.email;
      const newPost = new Post({
        description,
        user: { id: userId, name },
        image: req.file.buffer,
      });
      await newPost.save();
      res.send({
        ...newPost,
        likedByUser: newPost.likes.some((like) => like.likedById === userId),
      });
    } catch (error) {
      res.status(500).json("Something unexpected happened");
    }
  }
);

app.get("/posts", authorize, async (req: Request, res: Response) => {
  const posts = await Post.find();
  try {
    res.send(posts);
  } catch (error) {
    res.status(500).json("Something unexpected happened");
  }
});

app.put("/like", authorize, async (req: Request, res: Response) => {
  try {
    const { postId: _id } = req.body;
    const userId = (req as any).userId;

    const post = await Post.findOne({ _id });
    if (!post) {
      res.status(404).json("Post not found");
    }
    const likesArray: any[] = post?.likes || [];
    const userIdIndex = likesArray?.findIndex((aa) => {
      return new ObjectId(aa.likedById).equals(new ObjectId(userId));
    });
    if (userIdIndex !== -1) {
      likesArray.splice(userIdIndex, 1);
    } else {
      likesArray.push({ likedById: new ObjectId(userId) });
    }
    await post?.updateOne({ likes: likesArray });

    res.send(likesArray);
  } catch (error) {
    res.status(500).json("Something unexpected happened");
  }
});

app.post("/comment", authorize, async (req: Request, res: Response) => {
  try {
    const { postId: _id, comment } = req.body;
    const userId = (req as any).userId;

    const updatedPost = await Post.findByIdAndUpdate(
      _id,
      {
        $push: {
          comments: { comment, author: userId },
        },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json("Post not found");
    }

    res.send(updatedPost.comments);
  } catch (error) {
    res.status(500).json("Something unexpected happened");
  }
});

function sendNewToken(
  user: IUserData,
  res: express.Response<any, Record<string, any>>
) {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "", {
    expiresIn: "24h",
  });
  res.json({ token });
}
