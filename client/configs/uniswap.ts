import { ChainId } from "@uniswap/sdk-core";
import { config as loadEnvironmentVariables } from "dotenv";

loadEnvironmentVariables();

export const SWAP_ROUTER_ADDRESS = {
  [ChainId.BNB]: "0xeC8B0F7Ffe3ae75d7FfAb09429e3675bb63503e4",
  [ChainId.ARBITRUM_ONE]: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  [ChainId.POLYGON]: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  [ChainId.MAINNET]: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
};
