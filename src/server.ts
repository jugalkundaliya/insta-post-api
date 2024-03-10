import mongoose from "mongoose";
const uri = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=${process.env.MONGO_CLUSTER_NAME}`;

async function run() {
  mongoose
    .connect(uri, {
      bufferCommands: false, // Disable command buffering
    })
    .then(() => console.log("MongoDB connected successfully"));
}

run().catch(console.dir);
