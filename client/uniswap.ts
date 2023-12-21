import { BaseContract, ethers } from "ethers";
import { ethers as ethers5 } from "ethers-v5";
import dotenv from "dotenv";

import { erc20ABI } from "@wagmi/core";

import { bscTokens } from "@pancakeswap/tokens";
import { Contract } from "ethers";
import { Erc20 } from "./types/Erc20.js";
import {
  AlphaRouter,
  CurrencyAmount,
  SwapOptions,
  SwapRoute,
  SwapType,
} from "@uniswap/smart-order-router";
import { DEADLINE, SWAP_ROUTER_ADDRESS } from "./configs";
import { ChainId, Percent, TradeType } from "@uniswap/sdk-core";
import { Native } from "@pancakeswap/sdk";
dotenv.config();

async function main() {
  const args = process.argv;
  const tokenAIndex = args.indexOf("tokenA");
  const tokenBIndex = args.indexOf("tokenB");
  const amountIndex = args.indexOf("amount");
  if (tokenAIndex < 0 || tokenBIndex < 0 || amountIndex < 0) {
    console.log("Please provide swap arguments");
    return;
  }

  const tokenA = args[tokenAIndex + 1] as keyof typeof bscTokens;
  const tokenB = args[tokenBIndex + 1] as keyof typeof bscTokens;
  const amount = Number(args[amountIndex + 1]);

  if (amount <= 0) {
    console.log("Amount > 0");
    return;
  }
  await swap(tokenA, tokenB, amount);
}

async function swap(
  tokenASlug: keyof typeof bscTokens | "native",
  tokenBSlug: keyof typeof bscTokens | "native",
  amountA: number
) {
  const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
  const providerV5 = new ethers5.providers.JsonRpcProvider(
    process.env.BSC_MAINNET_RPC_URL
  );
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const bal = await provider.getBalance(signer.address);
  console.log("User balance " + bal.toString());
  const chainId = ChainId.BNB;

  const swapFrom =
    tokenASlug === "native" ? Native.onChain(chainId) : bscTokens[tokenASlug];
  const swapTo =
    tokenBSlug === "native" ? Native.onChain(chainId) : bscTokens[tokenBSlug];

  const amountIn = CurrencyAmount.fromRawAmount(
    swapFrom,
    amountA * 10 ** swapFrom.decimals
  );

  const router = new AlphaRouter({
    chainId: chainId,
    provider: providerV5,
  });
  const route = await router.route(amountIn, swapTo, TradeType.EXACT_INPUT, {
    recipient: signer.address,
    slippageTolerance: new Percent(
      process.env.SLIPPAGE_TOLERANCE || 50,
      10_000
    ), // 0.5%
    deadline: DEADLINE,
    type:
      chainId === ChainId.BNB
        ? SwapType.UNIVERSAL_ROUTER
        : SwapType.SWAP_ROUTER_02,
  } as SwapOptions);

  console.log(
    `Swapping ${amountIn} ${swapFrom.symbol} for ${route?.quote.toFixed(
      swapTo.decimals
    )} ${swapTo.symbol}.`
  );

  if (swapFrom.isToken) {
    const swapFromERC20: Erc20 = new Contract(
      swapFrom.address,
      erc20ABI,
      provider
    ) as BaseContract as Erc20;

    const allowance = await swapFromERC20.allowance(
      signer.address,
      SWAP_ROUTER_ADDRESS[chainId]
    );
    if (allowance >= BigInt(amountA * 10 ** swapFrom.decimals)) {
      const tx = await swapFromERC20
        .connect(signer)
        .approve(
          SWAP_ROUTER_ADDRESS[chainId],
          BigInt(amountA * 10 ** swapFrom.decimals)
        );
      console.log({ tx });
    }
  }

  const buildSwapTransaction = (
    walletAddress: string,
    routerAddress: string,
    route: SwapRoute | null
  ) => {
    return {
      data: route?.methodParameters?.calldata,
      to: routerAddress,
      value: BigInt(route?.methodParameters?.value ?? 0),
      from: walletAddress,
      gasPrice: route?.gasPriceWei.toBigInt(),
      gasLimit: route?.estimatedGasUsed.div(100).mul(115).toBigInt(), // Add a 15% buffer on top.
    };
  };

  const swapTransaction = buildSwapTransaction(
    signer.address,
    SWAP_ROUTER_ADDRESS[chainId],
    route
  );

  await signer.sendTransaction(swapTransaction);
}
main();
