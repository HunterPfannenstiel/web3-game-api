import { SmolBrainServerResponse } from "types/metadata/smol";
import { getAlchemy } from "../../utils/ethers";
import { SmolBrainAttribute } from "../../types/metadata/smol";
import {
  getSmolTraitContract,
  getSmolTraits,
} from "../../contracts/smol-traits";
import { TokenMetadata } from "types/metadata";

export const getNFTMetadata = async (
  contractAddress: string,
  account: string
) => {
  const alchemy = getAlchemy();
  const { ownedNfts } = await alchemy.nft.getNftsForOwner(account, {
    contractAddresses: [contractAddress],
  });
  return ownedNfts.map((nft) => {
    return {
      tokenId: nft.tokenId,
      attributes: nft.rawMetadata?.attributes,
      image: nft.rawMetadata?.image,
    } as TokenMetadata;
  });
};

export const getSmolMetadata = async (account: string) => {
  const alchemy = getAlchemy();
  const { ownedNfts } = await alchemy.nft.getNftsForOwner(account, {
    contractAddresses: ["0xA7f1462e0EcdeEbDeE4FaF6681148Ca96Db78777"],
  });
  const traitContract = getSmolTraitContract();
  const smolPromises = ownedNfts.map((smolBrain) => {
    return new Promise<SmolBrainServerResponse>(async (resolve) => {
      const traits = await getSmolTraits(smolBrain.tokenId, traitContract);
      resolve({
        traitInfo: traits,
        smol: {
          tokenId: smolBrain.tokenId,
          image: smolBrain.rawMetadata!.image!,
          attributes: smolBrain.rawMetadata!.attributes as SmolBrainAttribute[],
        },
      });
    });
  });
  const smolBrains = await Promise.all(smolPromises);
  return smolBrains;
};
