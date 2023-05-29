import ethers from "ethers";
import { Network, Alchemy } from "alchemy-sdk";

// export const getAlchemyProvider = (network = "arbitrum") => {
//   const provider = new ethers.AlchemyProvider(network, process.env.ALCHEMY_KEY);
//   return provider;
// };

export const getAlchemy = (network = Network.ARB_MAINNET) => {
  const settings = {
    apiKey: process.env.ALCHEMY_KEY,
    network,
  };
  const alchemy = new Alchemy(settings);
  return alchemy;
};
