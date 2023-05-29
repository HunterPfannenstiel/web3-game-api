export type SmolBrain = {
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
