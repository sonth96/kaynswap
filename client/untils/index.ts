import { ERC20Token, Native } from "@pancakeswap/sdk";
import { bscTokens, ethereumTokens } from "@pancakeswap/tokens";
import { ChainId } from "@uniswap/sdk-core";

export function getRpcUrlByChainId(chainId: ChainId): string {

  switch (chainId) {
    case ChainId.BNB:
      return process.env.BSC_MAINNET_RPC_URL!
    case ChainId.MAINNET:
      return process.env.ETH_MAINNET_RPC_URL!
    default:
      return "";
  }
}

export function getTokenByChainId(chainId: ChainId, tokenSlug: string) {
  switch (chainId) {
    case ChainId.BNB:
      return tokenSlug === "native" ? Native.onChain(chainId) : bscTokens[tokenSlug as keyof typeof bscTokens];

    case ChainId.MAINNET:
      return tokenSlug === "native" ? Native.onChain(chainId) : ethereumTokens[tokenSlug as keyof typeof ethereumTokens];
    default:
      return undefined;
  }

}
