import { UserToken } from "@customTypes/database";
import { apiQuery } from "@utils/database/connect";
import { BigNumberish, ethers } from "ethers";

const gameMintData = ["address", "uint256[]", "uint256[]"];
type GameMintData = { address: string; tokenInfo: UserToken[] };

export const decodeGameMintData = (
  transactions: { data: string }[]
): GameMintData[] => {
  const gameDatas = transactions.map(({ data }) => {
    const mintInfo = ethers.AbiCoder.defaultAbiCoder().decode(
      gameMintData,
      data
    );
    const ids = mintInfo[1].map((id: BigNumberish) =>
      ethers.toNumber(id)
    ) as number[];
    const amounts = mintInfo[2].map((amount: BigNumberish) =>
      ethers.toNumber(amount)
    ) as number[];
    const tokenInfo: UserToken[] = ids.map((id, i) => {
      return { tokenId: id, amount: amounts[i] };
    });
    return { address: mintInfo[0], tokenInfo };
  });
  return gameDatas;
};

export const mintTokensFromBlockchain = async (
  transactions: GameMintData[]
) => {
  transactions.forEach((transaction) => {
    transaction.tokenInfo = JSON.stringify(transaction.tokenInfo) as any;
  });
  const query = "CALL public.mint_tokens_from_blockchain($1, $2)";
  await apiQuery(query, [
    JSON.stringify(transactions),
    new Date().toUTCString(),
  ]);
};

// Result(3) [
//     '0x0e955494A2936501793119fFB66f901Ca2B11Aac',
//     Result(1) [ 1n ],
//     Result(1) [ 45n ]
//   ]

[{ address: "0x", tokenInfo: [{}] }];
