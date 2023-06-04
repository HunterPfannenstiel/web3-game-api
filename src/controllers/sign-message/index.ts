import { getAlchemyProvider, signBytes, signMessage } from "../../utils/ethers";
import { ServerError } from "../../custom-objects/ServerError";
import { ethers } from "ethers";
import { RequestHandler } from "express";
import {
  ClaimInfoStruct,
  MintInfoStruct,
  claimInfoStruct,
} from "../../types/game-contract";

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
    const futureTimestamp = await getValidTillTime();
    const claimInfo: ClaimInfoStruct = {
      minter: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
      validTill: futureTimestamp,
      nonce: 1,
      mintingDetails,
    };
    const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
      claimInfoStruct,
      [
        claimInfo.minter,
        claimInfo.validTill,
        claimInfo.nonce,
        claimInfo.mintingDetails.map((mint) => [mint.tokenId, mint.amount]),
      ]
    );

    const dataSig = await signBytes(encodedData);
    return res.status(200).json({ data: dataSig, message: encodedData });
  } catch (error) {
    next(error);
  }
};

const getValidTillTime = async (futureMinutes = 5) => {
  const alchemy = getAlchemyProvider();
  const currBlockNum = await alchemy.getBlockNumber();
  const block = await alchemy.getBlock(currBlockNum);
  const timeStamp = block?.timestamp;
  if (!timeStamp) {
    throw new ServerError("Could not fetch the current block timestamp", 500);
  }
  console.log(timeStamp);
  const fiveMinutes = futureMinutes * 60;
  const futureTimestamp = timeStamp + fiveMinutes;
  return futureTimestamp;
};

export default controller;
//
