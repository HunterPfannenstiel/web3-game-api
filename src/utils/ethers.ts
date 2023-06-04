import { ethers } from "ethers";
import { Network, Alchemy } from "alchemy-sdk";

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
