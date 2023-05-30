import { getSignedContract } from "../../utils/ethers";
import abi from "./abi.json";
import { Contract } from "ethers";
import {
  SmolTrait,
  SmolTraitResponse,
  enumToTrait,
} from "../../types/metadata/smol";

export const getSmolTraitContract = () => {
  return getSignedContract(SMOL_TRAITS_ADDRESS, abi);
};

export const getSmolTraits = async (tokenId: string, contract: Contract) => {
  const traitIds = (await contract.getTraitsOwnedBySmol(tokenId)) as number[];
  const traitPromises = traitIds.map((id) => {
    return new Promise<SmolTrait>(async (resolve) => {
      const traitInfo = (await contract.getTraitInfo(id)) as SmolTraitResponse;
      resolve({
        name: traitInfo.name,
        traitType: enumToTrait[traitInfo.traitType],
      });
    });
  });

  const traits = await Promise.all(traitPromises);
  return traits;
};

const SMOL_TRAITS_ADDRESS = "0x747468e17cF47e861759e70a4355D6cB0b170bC6";
//Implementation - 0x4748c0D38FD2bB714BD020C4296553Da77496b51
