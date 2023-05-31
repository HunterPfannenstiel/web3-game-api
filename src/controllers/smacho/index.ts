import { getAlchemy } from "../../utils/ethers";
import { buildToken } from "../../utils/image";
import { NftTokenType } from "alchemy-sdk";
import { RequestHandler } from "express";
import { Layer } from "types/metadata";
import { SmolBrainAttribute, TraitTypeKey } from "types/metadata/smol";

const controller = {} as {
  getSmachoForToken: RequestHandler;
  getSmachosForAccount: RequestHandler;
};

controller.getSmachoForToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { download } = req.query;
    const alchemy = getAlchemy();
    const token = await alchemy.nft.getNftMetadata(
      "0xA7f1462e0EcdeEbDeE4FaF6681148Ca96Db78777",
      id,
      { tokenType: NftTokenType.ERC721 }
    );
    const metadata = token.rawMetadata?.attributes as SmolBrainAttribute[];
    const traitMap = {} as { [key in TraitTypeKey]: string | undefined };
    metadata.forEach((meta) => {
      traitMap[meta.trait_type] =
        meta.value === "none" ? undefined : meta.value;
    });
    //Gender - append gender to 'body' (ex: female-brown, male-black)
    const layers: Layer[] = [];
    //{traitType: "Background", traitVaule: traitMap["Background"]!},
    layers.push({ traitType: "Body", traitVaule: traitMap["Body"]! });
    if (traitMap["Clothes"])
      layers.push({ traitType: "Clothes", traitVaule: traitMap["Clothes"] });
    if (traitMap["Glasses"])
      layers.push({ traitType: "Glasses", traitVaule: traitMap["Glasses"] });
    if (traitMap["Hat"])
      layers.push({ traitType: "Hat", traitVaule: traitMap["Hat"] });
    if (traitMap["Mouth"])
      layers.push({ traitType: "Mouth", traitVaule: traitMap["Mouth"] });
    // if(traitMap["Hair"]) layers.push({traitType: "Clothes", traitVaule: traitMap["Hair"]})

    const smacho = await buildToken("SmolBrains", layers);
    res.setHeader("Content-Type", "image/png");
    if (download) {
      res.setHeader("Content-Disposition", `attachment; filename=${id}.png`);
    } else {
      res.setHeader("Content-Disposition", "inline");
    }

    return res.send(smacho);
  } catch (error) {
    next(error);
  }
};

export default controller;
