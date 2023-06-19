import { Request } from "express";

export type SignatureData = {
  ethereum_address: string;
  nonce: number;
  valid_till: number;
  tokens: [number, number][];
};

export type UserToken = {
  tokenId: number;
  amount: number;
};

export type UserSession = {
  accountId: number;
};

export interface AuthRequest extends Request {
  accountId: number;
}
