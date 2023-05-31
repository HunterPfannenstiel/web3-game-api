import path from "path";
import sharp from "sharp";
import { Layer } from "types/metadata";

export const buildToken = async (collectionName: string, layers: Layer[]) => {
  const files = layers.map((layer) => {
    return {
      input: getFileLocation(collectionName, layer.traitType, layer.traitVaule),
    };
  });
  const image = await sharp(files[0]!.input).composite(files).png().toBuffer();
  return image;
};

const getFileLocation = (
  collectionName: string,
  folderName: string,
  fileName: string
) => {
  return path.join(
    __dirname,
    "../",
    "CollectionImages",
    collectionName,
    folderName,
    `${fileName}.png`
  );
};
