// authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../schema/User";

// Interface for decoded user information
interface DecodedUser {
  id: string;
  // Add other user properties as needed
}

// Middleware function to check if the user is authorized
export function authorize(req: Request, res: Response, next: NextFunction) {
  // Get the token from the request headers
  const token = req.headers.authorization?.replace("Bearer ", "");

  // Check if token is present
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify the token
  jwt.verify(
    token,
    process.env.JWT_SECRET || "",
    async (error, decoded: any) => {
      if (error) {
        return res
          .status(403)
          .json({ message: "Failed to authenticate token" });
      }
      // If token is valid, attach the decoded user information to the request object
      if (decoded) {
        const userId = (await User.findById(decoded?.userId))?._id;
        if (userId) {
          (req as any).userId = userId.toString();
        } else {
          return res.status(403).json({ message: "Invalid user" });
        }
        next();
      } else {
        return res.status(403).json({ message: "Invalid token" });
      }
    }
  );
}
