export type SmolBrain = {
  tokenId: string;
  image: string;
  attributes: SmolBrainAttribute[];
};

export interface SmolBrainAttribute {
  trait_type: string;
  display_type: "numeric" | undefined;
  value: this["display_type"] extends "numeric" ? number : string;
}

type SmolBrainIQ = {
  trait_type: "IQ";
  value: number;
  display_type: "numeric";
};

type SmolBrainIQPending = {
  trait_type: "IQPending";
  value: number;
  display_type: "numeric";
};

type SmolBrainHeadSize = {
  trait_type: "Head Size";
  value: number;
  display_type: "numeric";
};

//Traits: "Background, Body, Clothes, Glasses, Hat, Hair, Mouth, Gender"

export const enumToTrait = {
  "0": "Background",
  "1": "Body",
  "2": "Hair",
  "3": "Clothes",
  "4": "Glasses",
  "5": "Hat",
  "6": "Mouth",
  "7": "Costume",
};

export type SmolTraitResponse = {
  amountClaimed: number;
  limitedOfferId: number;
  maxSupply: number;
  price: number;
  forSale: boolean;
  tradable: boolean;
  uncappedSupply: boolean;
  traitType: keyof typeof enumToTrait;
  subgroupId: number;
  name: string;
  uri: string;
};

export type SmolBrainServerResponse = {
  traitInfo: SmolTrait[];
  smol: SmolBrain;
};

export type SmolTrait = {
  name: string;
  traitType: string;
};
