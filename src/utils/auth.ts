import uid from "uid-safe";
import * as util from "ethereumjs-util";
import { ServerError } from "../custom-objects/ServerError";

export const generateSessionId = async () => {
  return await uid(24);
};

export const verifySignature = async (
  originalMessage: string,
  address: string,
  signature: string
) => {
  if (address && signature) {
    let nonce: string | Buffer =
      "\x19Ethereum Signed Message:\n" +
      originalMessage.length +
      originalMessage;

    nonce = util.keccak(Buffer.from(nonce, "utf-8"));
    const { v, r, s } = util.fromRpcSig(signature);
    const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s);
    const addrBuffer = util.publicToAddress(pubKey);
    const addr = util.bufferToHex(addrBuffer);

    if (addr === address) {
      return addr;
    } else {
      throw new ServerError("User does not own provided address", 400);
    }
  } else {
    throw new ServerError("No signature or address provided");
  }
};
