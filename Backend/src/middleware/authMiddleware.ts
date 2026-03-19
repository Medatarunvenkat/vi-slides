import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log(req.headers);
    return res.status(401).json({
      message: "token missing"
    });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {

    if (err) {
      return res.status(403).json({
        message: "invalid token"
      });
    }

    (req as any).user = user;
    next();
  });
};