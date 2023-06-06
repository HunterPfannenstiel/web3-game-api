import { RequestHandler } from "express";
import { UserToken } from "../../types/database";
import {
  createNewTransaction,
  getTransactionData,
  incrementUserBalance,
} from "./utils";
import {
  createMintingMessageAndSig,
  getValidTillTime,
} from "../../utils/ethers";
import { ServerError } from "../../custom-objects/ServerError";

const controller = {} as {
  postTokens: RequestHandler;
  postMintTransaction: RequestHandler;
  getTransactionInfo: RequestHandler;
};

type TokenBody = {
  accountId: number;
  tokens: UserToken[];
};

controller.postTokens = async (req, res, next) => {
  const { accountId, tokens } = req.body as TokenBody;
  try {
    await incrementUserBalance(accountId, tokens);
    res.status(200).json({ message: "Success!" });
  } catch (error) {
    next(error);
  }
};

controller.postMintTransaction = async (req, res, next) => {
  const { accountId, tokens } = req.body as TokenBody;
  if (typeof accountId !== "number") {
    throw new ServerError("The account id body key must be of type number");
  }
  if (typeof tokens !== "object") {
    throw new ServerError("The tokens body key must be of type array");
  }
  const negativeTokens = tokens.map((token) => {
    return { tokenId: token.tokenId, amount: -token.amount };
  });
  try {
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

controller.getTransactionInfo = async (req, res, next) => {
  const { accountId, transactionId } = req.query;
  try {
    if (typeof accountId !== "string") {
      throw new ServerError(
        "The account id query parameter must be of type string"
      );
    }
    if (typeof transactionId !== "string") {
      throw new ServerError(
        "The transaction id query parameter must be of type string"
      );
    }
    const data = await getTransactionData(+accountId, +transactionId);
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

export default controller;
