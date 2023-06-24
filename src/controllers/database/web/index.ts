import { addTimeToCurrentDate, setCookie, typeCheck } from "../../../utils";
import { RequestHandler } from "express";
import {
  getAccountInfo,
  getEthereumAccountId,
  linkEthereumAddress,
  viewTokenMetadata,
  viewTransactions,
} from "./utils";
import { AuthRequest, UserSession } from "types/database";
import { verifySignature } from "../../../utils/auth";
import { ServerError } from "../../../custom-objects/ServerError";
import {
  createSessionJWT,
  extractSessionFromCookies,
  verifyJWT,
} from "../../../middleware/auth";
import uid from "uid-safe";
import jwt from "jsonwebtoken";

const controller = {} as {
  postLoginWithEthereum: RequestHandler;
  postLinkWallet: RequestHandler;
  getTransactions: RequestHandler;
  getSigningChallenge: RequestHandler;
  getTokenMetadata: RequestHandler;
  getSessionInfo: RequestHandler;
};

controller.postLoginWithEthereum = async (req, res, next) => {
  try {
    const challengeJWT = req.cookies["signing-challenge"];

    if (!challengeJWT) {
      throw new ServerError(
        "The originally signed message was not provided, please get and sign a new message",
        400
      );
    }
    const { signature, address } = req.body;
    typeCheck(
      "string",
      { name: "signature", value: signature },
      { name: "address", value: address }
    );
    const { message } = (await verifyJWT(challengeJWT)) as { message: string };
    await verifySignature(message, address, signature);
    const accountId = await getEthereumAccountId(address);
    const jwt = createSessionJWT(accountId);
    setCookie(res, "session", jwt, addTimeToCurrentDate("Days", 3), "/");
    return res.status(200).json({ message: "Successful sign-in!" });
  } catch (error) {
    next(error);
  }
};

controller.postLinkWallet = async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const challengeJWT = req.cookies["signing-challenge"];
    if (!challengeJWT) {
      throw new ServerError(
        "The originally signed message was not provided, please get and sign a new message",
        400
      );
    }
    const { accountId } = authReq;
    const { signature, address } = req.body;
    typeCheck(
      "string",
      { name: "signature", value: signature },
      { name: "address", value: address }
    );
    const { message } = (await verifyJWT(challengeJWT)) as { message: string };

    await verifySignature(message, address, signature);
    await linkEthereumAddress(accountId, address);
    res.clearCookie("signing-challenge");
    return res.status(200).json({ message: "Successfully linked!" });
  } catch (error) {
    next(error);
  }
};

controller.getTransactions = async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const transactions = await viewTransactions(authReq.accountId);
    return res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

controller.getSigningChallenge = async (req, res, next) => {
  try {
    const id = await uid(12);
    const message = `Sign this message to gain access to the full potential of the Machoverse! One time use code: ${id}`;
    const token = jwt.sign({ message }, process.env.JWT_PASSWORD!, {
      expiresIn: 120,
    });
    setCookie(
      res,
      "signing-challenge",
      token,
      addTimeToCurrentDate("Minutes", 2),
      "/"
    );
    return res.status(200).json({ challenge: message });
  } catch (error) {
    next(error);
  }
};

controller.getTokenMetadata = async (req, res, next) => {
  try {
    const tokenMetadata = await viewTokenMetadata();
    return res.status(200).json(tokenMetadata);
  } catch (error) {
    next(error);
  }
};

controller.getSessionInfo = async (req, res, next) => {
  try {
    const sessionString = extractSessionFromCookies(req);
    if (!sessionString) {
      return res.redirect("/machoverse/login");
    }
    try {
      const { accountId } = (await verifyJWT(sessionString)) as UserSession;
      const accountInfo = await getAccountInfo(accountId);
      return res.status(200).json(accountInfo);
    } catch (error) {
      return res.redirect("/machoverse/login");
    }
  } catch (error) {
    next(error);
  }
};

export default controller;
