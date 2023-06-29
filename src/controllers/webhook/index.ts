import { AuthRequest } from "@customTypes/database";
import { AlchemyWebhookEvent } from "@middleware/alchemy";
import { RequestHandler } from "express";
import { decodeGameMintData, mintTokensFromBlockchain } from "./utils";

const controller = {} as {
  postMintToGame: RequestHandler;
  postConfirmTransaction: RequestHandler;
};

controller.postMintToGame = async (req, res, next) => {
  try {
    console.log("Validated signature");
    const webhookEvent = req.body as AlchemyWebhookEvent;
    console.log(webhookEvent.event.data.block.logs);
    if (webhookEvent.event.data.block.logs.length > 0) {
      const data = decodeGameMintData(webhookEvent.event.data.block.logs);
      console.log(data);
      await mintTokensFromBlockchain(data);
    }
    return res.status(200).end();
  } catch (error) {
    next(error);
  }
};

controller.postConfirmTransaction = async (req, res, next) => {
  try {
    const webhookEvent = req.body as AlchemyWebhookEvent;
    console.log(webhookEvent.event.data.block.logs);
  } catch (error) {
    next(error);
  }
};

export default controller;

// [
//   {
//     data: '0x0000000000000000000000000e955494a2936501793119ffb66f901ca2b11aac000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001',
//     topics: [
//       '0xfb0fc4852e2d10e0bb68241bebdf2c21df9c8e233ee92e26cacb91ac8c0033a3'
//     ]
//   },
//   {
//     data: '0x0000000000000000000000000e955494a2936501793119ffb66f901ca2b11aac000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001',
//     topics: [
//       '0xfb0fc4852e2d10e0bb68241bebdf2c21df9c8e233ee92e26cacb91ac8c0033a3'
//     ]
//   }
// ]
