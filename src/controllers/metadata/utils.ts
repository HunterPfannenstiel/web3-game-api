import { SmolBrain } from "types/metadata/smol";
import { getAlchemy } from "../../utils/ethers";
import { SmolBrainAttribute } from "../../types/metadata/smol";

export const getNFTMetadata = async (
  contractAddress: string,
  account: string
) => {
  const alchemy = getAlchemy();
  const { ownedNfts } = await alchemy.nft.getNftsForOwner(account, {
    contractAddresses: [contractAddress],
  });
  const smolBrains: SmolBrain[] = [];
  ownedNfts.forEach((smolBrain) => {
    smolBrains.push({
      image: smolBrain.rawMetadata!.image!,
      attributes: smolBrain.rawMetadata!.attributes as SmolBrainAttribute[],
    });
  });
  return smolBrains;
};
