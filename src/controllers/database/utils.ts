import { ServerError } from "@customObjects/ServerError";
import { UserToken } from "@customTypes/database";
import { createSessionJWT } from "@middleware/auth";
import { addTimeToCurrentDate, setCookie } from "@utils";
import { apiQuery } from "@utils/database/connect";
import { compare, hash } from "bcrypt";
import { Response } from "express";

export const incrementUserBalance = async (
  accountId: number,
  tokens: UserToken[]
) => {
  const query = "CALL public.modify_balance($1, $2)";
  await apiQuery(query, [accountId, JSON.stringify(tokens)]);
};

export const createNewTransaction = async (
  accountId: number,
  tokens: UserToken[],
  validTill: number
) => {
  const query = "CALL public.mint_tokens_to_blockchain($1, $2, $3, NULL, NULL)";
  const res = await apiQuery(query, [
    accountId,
    JSON.stringify(tokens),
    validTill,
  ]);
  return res.rows[0] as { next_nonce: number; address: string };
};

export const getTransactionData = async (
  accountId: number,
  transactionId: number
) => {
  const query = "SELECT * FROM public.get_transaction_data($1, $2)";

  const res = await apiQuery(query, [accountId, transactionId]);
  if (res.rows.length === 0) {
    throw new ServerError("Could not find transaction");
  }
  return res.rows[0] as {
    ethereum_address: string;
    valid_till: number;
    nonce: number;
    tokens: UserToken[];
  };
};

export const confirmTransaction = async (address: string, nonce: number) => {
  const query = "CALL public.confirm_transaction($1, $2)";
  await apiQuery(query, [address, nonce]);
};

export const getReclaimInfo = async (transactionId: number) => {
  const query = "SELECT * FROM public.get_reclaim_info($1)";
  const res = await apiQuery(query, [transactionId]);
  return res.rows[0] as {
    valid_till: number;
    account_id: number;
    account_address: string;
    is_pending: boolean;
    nonce: number;
  };
};

export const checkTransactionStatusInContract = async (
  accountAddress: string,
  nonce: number
) => {
  console.log("IMPLEMENT THIS FUNCTION");
  return false;
};

export const reclaimTransaction = async (
  accountId: number,
  transactionId: number
) => {
  const query = "CALL public.reclaim_pending_transaction($1, $2)";
  await apiQuery(query, [accountId, transactionId]);
};

export const viewUsersTokens = async (accountId: number) => {
  const query = "SELECT * FROM public.view_user_tokens($1)";
  const res = await apiQuery(query, [accountId]);
  return res.rows as UserToken[];
};

export const createSession = async (accountId: number) => {
  const userJWT = createSessionJWT(accountId);
  const query = "CALL public.create_session($1, $2)";
  await apiQuery(query, [accountId, userJWT]);
  return userJWT;
};

export const loginUser = async (username: string, password: string) => {
  const query = "SELECT * FROM public.get_user_details($1)";
  const res = await apiQuery(query, [username]);
  if (res.rows.length === 0) {
    throw new ServerError("Invalid credentials", 400);
  }
  const details = res.rows[0] as {
    account_id: number;
    hashed_password: string;
    jwt: string | null;
    address: string | null;
  };
  const isValid = await compare(password, details.hashed_password);
  if (!isValid) {
    throw new ServerError("Invalid credentials", 400);
  }
  let userJWT = details.jwt;
  let isNew = false;
  // if (details.jwt) {
  //   try {
  //     await verifyJWT(details.jwt);
  //     console.log("Valid JWT");
  //   } catch (error) {
  //     console.log("JWT expired, creating new one");
  //     userJWT = await createSession(details.account_id);
  //     isNew = true;
  //   }
  // } else {
  console.log("Creating JWT");
  userJWT = await createSession(details.account_id);
  isNew = true;
  // }
  return { jwt: userJWT!, isNew, address: details.address }!;
};

export const setSessionCookie = (
  res: Response,
  session: string,
  expireDate?: Date
) => {
  expireDate = !!expireDate ? expireDate : addTimeToCurrentDate("Days", 3);
  setCookie(res, "session", session, expireDate, "/");
  return expireDate;
};

export const deleteSessionCookie = (res: Response) => {
  setCookie(res, "session", "", new Date(new Date().setFullYear(2000)), "/");
};

export const createAccount = async (
  userName: string,
  password: string,
  ethereumAddress?: string
) => {
  const hashedPassword = await hash(password, 12);
  const query = "CALL public.create_account($1, $2, NULL, $3, NULL)";
  const res = await apiQuery(query, [
    userName,
    hashedPassword,
    ethereumAddress,
  ]);
  return res.rows[0].new_account_id as number;
};

export const deleteSession = async (accountId: number) => {
  const query = "CALL public.delete_session($1)";
  try {
    await apiQuery(query, [accountId]);
  } catch (error) {
    console.log("Error deleting session", error);
  }
};
