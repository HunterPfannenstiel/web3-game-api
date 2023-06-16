import { ethers } from "ethers";
import { Network, Alchemy } from "alchemy-sdk";
import { UserToken } from "types/database";
import { ServerError } from "../custom-objects/ServerError";
import { ClaimInfoStruct } from "../types/game-contract";

export const getAlchemyProvider = (network = "arbitrum") => {
  const provider = new ethers.AlchemyProvider(network, process.env.ALCHEMY_KEY);
  return provider;
};

export const getSigner = () => {
  const signer = new ethers.Wallet(
    process.env.PRIVATE_KEY!,
    getAlchemyProvider()
  );

  return signer;
};

export const getSignedContract = (
  contractAddress: string,
  abi: string,
  signer = getSigner()
) => {
  const contract = new ethers.Contract(contractAddress, abi, signer);
  return contract;
};

export const getAlchemy = (network = Network.ARB_MAINNET) => {
  const settings = {
    apiKey: process.env.ALCHEMY_KEY,
    network,
  };
  const alchemy = new Alchemy(settings);
  return alchemy;
};

export const signMessage = async (message: string) => {
  const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!);
  const signature = await signer.signMessage(ethers.toBeArray(messageHash));
  return signature;
};

export const signBytes = async (bytes: string) => {
  const messageHash = ethers.keccak256(bytes);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!);
  const signature = await signer.signMessage(ethers.toBeArray(messageHash));
  return signature;
};

export const createMintingMessageAndSig = async (
  minter: string,
  nonce: number,
  mintingDetails: UserToken[],
  validTill: number
) => {
  const claimInfo: ClaimInfoStruct = {
    minter,
    validTill,
    nonce,
    mintingDetails,
  };
  const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
    claimInfoStruct,
    [
      claimInfo.minter,
      claimInfo.validTill,
      claimInfo.nonce,
      claimInfo.mintingDetails.map((mint) => [mint.tokenId, mint.amount]),
    ]
  );
  const dataSig = await signBytes(encodedData);
  return { data: encodedData, signature: dataSig };
};

export const claimInfoStruct = [
  "address",
  "uint256",
  "uint256",
  "tuple(uint256, uint256)[]",
];

export const getCurrentBlockTime = async () => {
  const alchemy = getAlchemyProvider();
  const currBlockNum = await alchemy.getBlockNumber();
  const block = await alchemy.getBlock(currBlockNum);
  const timeStamp = block?.timestamp;
  if (!timeStamp) {
    throw new ServerError("Could not fetch the current block timestamp", 500);
  }
  return timeStamp;
};

export const getValidTillTime = async (futureMinutes = 5) => {
  const timeStamp = await getCurrentBlockTime();
  console.log(timeStamp);
  const fiveMinutes = futureMinutes * 60;
  const futureTimestamp = timeStamp + fiveMinutes;
  return futureTimestamp;
};
