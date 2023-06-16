import { RequestHandler } from "express";
import { UserToken } from "../../types/database";
import {
  checkTransactionStatusInContract,
  confirmTransaction,
  createNewTransaction,
  getReclaimInfo,
  getTransactionData,
  incrementUserBalance,
  reclaimTransaction,
} from "./utils";
import {
  createMintingMessageAndSig,
  getCurrentBlockTime,
  getValidTillTime,
} from "../../utils/ethers";
import { ServerError } from "../../custom-objects/ServerError";
import { getMinutesAndSeconds } from "../../utils";

const controller = {} as {
  postTokens: RequestHandler;
  postMintTransaction: RequestHandler;
  getTransactionInfo: RequestHandler;
  postTransactionConfirmation: RequestHandler;
  postReclaimTransaction: RequestHandler;
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

/**
 * The route used to initiate a minting request.
 *  The server will respond with the raw data and the signed data that can be used to claim the tokens from the database
 */
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

controller.postTransactionConfirmation = async (req, res, next) => {
  try {
    const { userAddress, nonce } = req.body; //Implement moralis stream or alchemy websocket to get actaull address and nonce
    await confirmTransaction(userAddress as string, +(nonce as string));
    return res.status(200).end();
  } catch (error) {
    next(error);
  }
};

controller.postReclaimTransaction = async (req, res, next) => {
  try {
    const { accountId, transactionId } = req.body;
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

export default controller;
