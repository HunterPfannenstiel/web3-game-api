import { addTimeToCurrentDate, typeCheck } from "../utils";
import { ServerError } from "../custom-objects/ServerError";
import { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, UserSession } from "../types/database";

export const authMiddleware =
  (isWebRoute?: boolean): RequestHandler =>
  async (req, res, next) => {
    let sessionString: string;
    try {
      if (isWebRoute === undefined) {
        sessionString =
          extractSessionFromCookies(req) || extractFromClient(req);
      } else if (isWebRoute) {
        sessionString = extractSessionFromCookies(req);
      } else {
        sessionString = extractFromClient(req);
      }
      try {
        typeCheck("string", { name: "session", value: sessionString });
      } catch (error) {
        throw new ServerError(
          "Please sign-in before accessing this route",
          400
        );
      }
      const { accountId } = (await verifyJWT(sessionString)) as UserSession;
      const authRequest = req as AuthRequest;
      console.log("Auth middleware account id: ", accountId);
      authRequest.accountId = accountId;
      next();
    } catch (error) {
      next(error);
    }
  };

export const extractSessionFromCookies = (req: Request) => {
  return req.cookies["session"];
};

const extractFromClient = (req: Request) => {
  if (req.method === "GET") {
    return req.query.session as string;
  } else if (req.method === "POST" || req.method === "PATCH") {
    return req.body.session;
  } else {
    throw new ServerError(`Unexpected request method [${req.method}]`);
  }
};

export const createSessionJWT = (accountId: number) => {
  const sessionExpiry = addTimeToCurrentDate("Days", 3);
  const token = jwt.sign({ accountId }, process.env.JWT_PASSWORD!, {
    expiresIn: "3 days",
  });
  return { token, sessionExpiry };
};

export const verifyJWT = async (tokenString: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      tokenString as string,
      process.env.JWT_PASSWORD!,
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    );
  });
};
