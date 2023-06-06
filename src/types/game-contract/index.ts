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
