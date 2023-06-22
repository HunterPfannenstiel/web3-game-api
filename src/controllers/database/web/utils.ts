import { apiQuery } from "../../../utils/database/connect";
import { ServerError } from "../../../custom-objects/ServerError";
import { compare } from "bcrypt";
import { createSessionJWT, verifyJWT } from "../../../middleware/auth";
import { MachoToken, Transaction } from "types/database";

export const loginUser = async (username: string, password: string) => {
  const query = "SELECT * FROM public.get_user_password_and_session($1)";
  const res = await apiQuery(query, [username]);
  if (res.rows.length === 0) {
    throw new ServerError("Invalid credentials", 400);
  }
  const details = res.rows[0] as {
    account_id: number;
    hashed_password: string;
    jwt: string | null;
  };
  const isValid = await compare(password, details.hashed_password);
  if (!isValid) {
    throw new ServerError("Invalid credentials", 400);
  }
  let userJWT = details.jwt;
  let isNew = false;
  if (details.jwt) {
    try {
      await verifyJWT(details.jwt);
      console.log("Valid JWT");
    } catch (error) {
      console.log("JWT expired, creating new one");
      userJWT = await createSession(details.account_id);
      isNew = true;
    }
  } else {
    console.log("Creating JWT, session not found");
    userJWT = await createSession(details.account_id);
    isNew = true;
  }
  return { jwt: userJWT!, isNew }!;
};

const createSession = async (accountId: number) => {
  const userJWT = createSessionJWT(accountId);
  const query = "CALL public.create_session($1, $2)";
  await apiQuery(query, [accountId, userJWT]);
  return userJWT;
};

export const linkEthereumAddress = async (
  accountId: number,
  address: string
) => {
  const query = "CALL public.link_ethereum_address($1, $2)";
  await apiQuery(query, [accountId, address]);
};

export const getEthereumAccountId = async (address: string) => {
  const query = "SELECT * FROM public.get_ethereum_account_id($1)";
  const res = await apiQuery(query, [address]);
  if (res.rows.length === 0) {
    throw new ServerError(
      "This address has not been linked to an account yet! Please link this address to an account first!"
    );
  }
  return res.rows[0].account_id as number;
};

export const viewUserTokensWithMetadata = async (accountId: number) => {
  const query = "SELECT * FROM public.view_user_tokens_with_metadata($1)";
  const res = await apiQuery(query, [accountId]);
  return res.rows as MachoToken[];
};

export const viewTransactions = async (accountId: number) => {
  const query = "SELECT * FROM public.view_transactions($1)";
  const res = await apiQuery(query, [accountId]);
  return res.rows as Transaction[];
};
