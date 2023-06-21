import { addTimeToCurrentDate, setCookie, typeCheck } from "../../../utils";
import { RequestHandler } from "express";
import { getEthereumAccountId, linkEthereumAddress, loginUser } from "./utils";
import { AuthRequest } from "types/database";
import { verifySignature } from "../../../utils/auth";
import { ServerError } from "../../../custom-objects/ServerError";
import { createSessionJWT, verifyJWT } from "../../../middleware/auth";
import uid from "uid-safe";
import jwt from "jsonwebtoken";

const controller = {} as {
  postLogin: RequestHandler;
  postLoginWithEthereum: RequestHandler;
  postLinkWallet: RequestHandler;
  getSigningChallenge: RequestHandler;
};

controller.postLogin = async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    typeCheck(
      "string",
      { name: "userName", value: userName },
      { name: "password", value: password }
    );
    const { jwt, isNew } = await loginUser(userName, password);
    setCookie(res, "session", jwt, addTimeToCurrentDate("Days", 3), "/");
    return res.status(200).end();
  } catch (error) {
    next(error);
  }
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

export default controller;
