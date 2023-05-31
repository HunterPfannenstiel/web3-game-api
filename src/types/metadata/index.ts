export type TokenMetadata = {
  tokenId: string;
  attributes: Record<string, any>[] | undefined;
  image?: string | undefined;
};

export type Layer = {
  traitType: string;
  traitVaule: string;
};
