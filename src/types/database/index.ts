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

export type MachoToken = {
  name: string;
  image: string;
  type: "coin" | "item";
  colors: TokenColor;
};

export type MachoTokens = { [tokenId: number]: MachoToken };

type TokenColor = {
  borderColor: string;
  fillColor: string;
};

export type Transaction = {
  created_on: string;
  tokens: UserToken[];
  pending: boolean;
  confirmed: boolean;
  completed_on: string | null;
  transaction_id: number;
};
