import { apiQuery } from "../../../utils/database/connect";
import { ServerError } from "../../../custom-objects/ServerError";
import { checkRowLength } from "@utils";
import { MachoTokens, Transaction } from "@customTypes/database";

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

export const viewTokenMetadata = async () => {
  const query = "SELECT * FROM public.view_token_metadata()";
  const res = await apiQuery(query);
  return res.rows[0].tokens as MachoTokens;
};

export const viewTransactions = async (accountId: number) => {
  const query = "SELECT * FROM public.view_transactions($1)";
  const res = await apiQuery(query, [accountId]);
  return res.rows as Transaction[];
};

export const getAccountInfo = async (accountId: number) => {
  const query = "SELECT * FROM public.get_account_info($1)";
  const res = await apiQuery(query, [accountId]);
  checkRowLength(res);
  return res.rows[0] as { user_name: string; address: string };
};
