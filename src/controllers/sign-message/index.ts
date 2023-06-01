import { signMessage } from "../../utils/ethers";
import { ServerError } from "../../custom-objects/ServerError";
import { ethers } from "ethers";
import { RequestHandler } from "express";

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
    const mintingInfo = [
      {
        tokenId: 1,
        amount: 1000,
      },
      {
        tokenId: 2,
        amount: 1000,
      },
    ];
    const encodedData = mintingInfo.map((info) =>
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint", "uint"],
        [info.tokenId, info.amount]
      )
    );
    const data = ethers.concat(encodedData);

    console.log("Encoded data", data);
    const dataSig = await signMessage(data);
    return res.status(200).json({ data: dataSig });
  } catch (error) {
    next(error);
  }
};

export default controller;
