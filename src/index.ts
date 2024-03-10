import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", async (req: Request, res: Response) => {
  res.send("Init request success");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
