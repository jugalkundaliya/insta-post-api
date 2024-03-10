import mongoose, { InferSchemaType, Schema, Types } from "mongoose";
import { ICommonObject } from "../interfaces/ICommonData";

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export interface IUserData
  extends InferSchemaType<typeof userSchema>,
    ICommonObject {}

export default mongoose.model("Instagram_User", userSchema);
