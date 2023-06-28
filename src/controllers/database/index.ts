import {
  AuthRequest,
  SessionDetails,
  UserSession,
  UserToken,
} from "@customTypes/database";
import { RequestHandler } from "express";
import {
  checkTransactionStatusInContract,
  confirmTransaction,
  createAccount,
  createNewTransaction,
  createDatabaseSession,
  deleteSession,
  deleteSessionCookie,
  getReclaimInfo,
  getTransactionData,
  incrementUserBalance,
  loginUser,
  reclaimTransaction,
  setSessionCookie,
  viewUsersTokens,
  viewUsersBlockchainTokens,
} from "./utils";
import {
  addTimeToCurrentDate,
  getMinutesAndSeconds,
  optionalStringCheck,
  setCookie,
  typeCheck,
} from "@utils";
import { ServerError } from "@customObjects/ServerError";
import {
  createMintingMessageAndSig,
  getCurrentBlockTime,
  getValidTillTime,
} from "@utils/ethers";

import { validationResult } from "express-validator";
import { extractSessionFromCookies, verifyJWT } from "@middleware/auth";

const controller = {} as {
  postTokens: RequestHandler;
  postMintTransaction: RequestHandler;
  postTransactionConfirmation: RequestHandler;
  postReclaimTransaction: RequestHandler;
  postLogin: RequestHandler;
  postSignup: RequestHandler;
  postLogout: RequestHandler;
  getTransactionInfo: RequestHandler;
  getUsersTokens: RequestHandler;
};

type TokenBody = {
  tokens: UserToken[];
};

controller.postTokens = async (req, res, next) => {
  const authReq = req as AuthRequest;
  const { accountId } = authReq;
  const { tokens } = req.body as TokenBody;
  try {
    await incrementUserBalance(accountId, tokens);
    res.status(200).json({ message: "Success!" });
  } catch (error) {
    next(error);
  }
};

/**
 * The route used to initiate a minting request.
 *  The server will respond with the raw data and the signed data that can be used to claim the tokens from the database
 */
controller.postMintTransaction = async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const { accountId } = authReq;
    const { tokens } = req.body as TokenBody;
    typeCheck("object", { name: "tokens", value: tokens });
    const negativeTokens = tokens.map((token) => {
      if (token.amount < 0) {
        throw new ServerError(
          `Cannot withdraw a negative amount of token ${token.tokenId}`,
          400
        );
      }
      return { tokenId: token.tokenId, amount: -token.amount };
    });
    const validTill = await getValidTillTime();
    const { next_nonce, address } = await createNewTransaction(
      accountId,
      negativeTokens,
      validTill
    );

    const transactionInfo = await createMintingMessageAndSig(
      address,
      next_nonce,
      tokens,
      validTill
    );
    return res.status(200).json(transactionInfo);
  } catch (error) {
    next(error);
  }
};

controller.postTransactionConfirmation = async (req, res, next) => {
  try {
    const { userAddress, nonce } = req.body; //Implement moralis stream or alchemy websocket to get actual address and nonce
    await confirmTransaction(userAddress as string, +(nonce as string));
    return res.status(200).end();
  } catch (error) {
    next(error);
  }
};

controller.postReclaimTransaction = async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const { accountId } = authReq;
    const { transactionId } = req.body;
    typeCheck("number", { name: "transactionId", value: transactionId });
    const info = await getReclaimInfo(transactionId);
    if (!info.is_pending) {
      throw new ServerError(
        "Cannot reclaim a transaction that is not pending",
        400
      );
    }
    if (info.account_id !== accountId) {
      throw new ServerError("This is not your transaction to reclaim.", 401);
    }
    const isConfirmed = await checkTransactionStatusInContract(
      info.account_address,
      info.nonce
    );

    if (isConfirmed) {
      throw new ServerError(
        "This transaction has been confirmed on the blockchain and is awaiting final confirmation before updating.",
        400
      );
    }
    const currBlockTime = await getCurrentBlockTime();
    if (info.valid_till > currBlockTime) {
      const timeRemaining = getMinutesAndSeconds(
        info.valid_till - currBlockTime
      );
      throw new ServerError(
        `Current transaction is still active, please claim the transaction or wait approximately: 
        ${timeRemaining.wholeMinutes} minutes and ${timeRemaining.wholeSeconds} seconds before reclaiming.`,
        400
      );
    }
    await reclaimTransaction(accountId, transactionId);
    return res.status(200).json({ message: "Transaction reclaimed" });
  } catch (error) {
    next(error);
  }
};

controller.postLogin = async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    typeCheck(
      "string",
      { name: "userName", value: userName },
      { name: "password", value: password }
    );
    const { jwt, isNew, address, sessionExpiry } = await loginUser(
      userName,
      password
    );
    setSessionCookie(res, jwt, sessionExpiry);
    return res
      .status(200)
      .json({ address, sessionExpiry, isSignedIn: true } as SessionDetails);
  } catch (error) {
    next(error);
  }
};

controller.postSignup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ServerError(errors.array()[0].msg, 422);
    }
    const { userName, password } = req.body;
    const accountId = await createAccount(userName, password);
    const { token, sessionExpiry } = await createDatabaseSession(accountId);
    setSessionCookie(res, token, sessionExpiry);
    return res.status(200).json({
      isSignedIn: true,
      sessionExpiry,
      address: undefined,
    } as SessionDetails);
    // .redirect(`${process.env.MARKETPLACE_DOMIAN}/machoverse/link`);
  } catch (error) {
    next(error);
  }
};

controller.postLogout = async (req, res, next) => {
  try {
    const session = extractSessionFromCookies(req);
    deleteSessionCookie(res);
    if (!session) {
      return res.status(200).json({ message: "Nothing to log out of" });
    }
    const { accountId } = (await verifyJWT(session)) as UserSession;
    deleteSession(accountId);
    return res.status(200).json({ message: "Logged user out" });
  } catch (error) {
    next(error);
  }
};

controller.getTransactionInfo = async (req, res, next) => {
  const authReq = req as AuthRequest;
  const { accountId } = authReq;
  const { transactionId } = req.query;
  try {
    typeCheck("string", { name: "transactionId", value: transactionId });
    const data = await getTransactionData(+accountId!, +transactionId!);
    const transactionInfo = await createMintingMessageAndSig(
      data.ethereum_address,
      data.nonce,
      data.tokens,
      data.valid_till
    );
    return res.status(200).json(transactionInfo);
  } catch (error) {
    next(error);
  }
};

controller.getUsersTokens = async (req, res, next) => {
  try {
    const authReq = req as AuthRequest;
    const { accountId } = authReq;
    const { inventory } = req.query;
    let tokens: UserToken[] = [];
    optionalStringCheck({ name: "inventory", value: inventory });

    if (inventory === "blockchain") {
      tokens = await viewUsersBlockchainTokens(accountId);
    } else {
      tokens = await viewUsersTokens(+accountId!);
    }
    return res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
};

export default controller;
