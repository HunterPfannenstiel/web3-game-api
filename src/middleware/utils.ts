import { RequestHandler } from "express";

export const unless =
  (path: string, middleware: RequestHandler): RequestHandler =>
  (req, res, next) => {
    if (path === req.baseUrl) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
