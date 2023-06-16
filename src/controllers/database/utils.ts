import { apiQuery } from "../../utils/database/connect";
import { UserToken } from "../../types/database";

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
