export type ClaimInfoStruct = {
  minter: string;
  validTill: number;
  nonce: number;
  mintingDetails: MintInfoStruct[];
};

export type MintInfoStruct = {
  tokenId: number;
  amount: number;
};

export const claimInfoStruct = [
  "address",
  "uint256",
  "uint256",
  "tuple(uint256, uint256)[]",
];
