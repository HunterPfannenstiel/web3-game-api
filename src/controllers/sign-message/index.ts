import { createMintingMessageAndSig, signMessage } from "../../utils/ethers";
import { ServerError } from "../../custom-objects/ServerError";
import { RequestHandler } from "express";
import { MintInfoStruct } from "../../types/game-contract";

const controller = {} as {
  getSignedMessage: RequestHandler;
  getMintingMessage: RequestHandler;
};

controller.getSignedMessage = async (req, res, next) => {
  try {
    const { message } = req.query;
    if (typeof message !== "string") {
      throw new ServerError("Invalid message to sign", 400);
    }
    const signature = await signMessage(message);
    return res.status(200).json({ signature });
  } catch (error) {
    next(error);
  }
};

controller.getMintingMessage = async (req, res, next) => {
  try {
    const mintingDetails: MintInfoStruct[] = [
      { tokenId: 1, amount: 1000 },
      { tokenId: 2, amount: 1000 },
      { tokenId: 500, amount: 1 },
    ];
    const { minter, nonce } = req.query;
    const mint = await createMintingMessageAndSig(
      minter as string,
      +(nonce as string),
      mintingDetails,
      21687665001
    );
    return res.status(200).json(mint);
  } catch (error) {
    next(error);
  }
};

export default controller;
//
