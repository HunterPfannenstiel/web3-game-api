import { RequestHandler } from "express";
import { getNFTMetadata, getSmolMetadata } from "./utils";
import { ServerError } from "../../custom-objects/ServerError";

const controller = {} as {
  getUserMetadata: RequestHandler;
  getUserSmolMetadata: RequestHandler;
};

const getUserMetadata: RequestHandler = async (req, res, next) => {
  try {
    const { contract } = req.params; //contract address
    const { account } = req.query; //user to retrieve metadata for
    if (typeof account !== "string") {
      throw new ServerError(
        "Please provide a single account as a query parameter ",
        400
      );
    }
    const tokens = await getNFTMetadata(contract, account);
    return res.status(200).json({ tokens });
  } catch (error: any) {
    next(error);
  }
};

const getUserSmolMetadata: RequestHandler = async (req, res, next) => {
  try {
    const { account } = req.query; //user to retrieve metadata for
    if (typeof account !== "string") {
      throw new ServerError(
        "Please provide a single account as a query parameter ",
        400
      );
    }
    const smolBrains = await getSmolMetadata(account);
    return res.status(200).json({ tokens: smolBrains });
  } catch (error: any) {
    next(error);
  }
};

controller.getUserMetadata = getUserMetadata;
controller.getUserSmolMetadata = getUserSmolMetadata;

export default controller;
