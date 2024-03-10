import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User, { IUserData } from "./schema/User";
dotenv.config();
const cors = require("cors");
import "./server";

const app: Express = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

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

function sendNewToken(
  user: IUserData,
  res: express.Response<any, Record<string, any>>
) {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "", {
    expiresIn: "24h",
  });
  res.json({ token });
}
