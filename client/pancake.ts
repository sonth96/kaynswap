import { ethers } from "ethers";
import dotenv from "dotenv";
import { createPublicClient, hexToBigInt, http } from "viem";

import { erc20ABI, mainnet } from "@wagmi/core";
import {
  SMART_ROUTER_ADDRESSES,
  SmartRouter,
  SwapRouter,
} from "@pancakeswap/smart-router";
import { GraphQLClient } from "graphql-request";
import {
  ChainId,
  CurrencyAmount,
  Native,
  Percent,
  TradeType,
} from "@pancakeswap/sdk";
import { bscTokens } from "@pancakeswap/tokens";
import { publicProvider } from "@wagmi/core/providers/public";
import { Contract } from "ethers";
import { Erc20 } from "./types/Erc20.js";
import { BaseContract } from "ethers";
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
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const bal = await provider.getBalance(signer.address);
  console.log("User balance " + bal.toString());
  const chainId = ChainId.BSC;

  const swapFrom =
    tokenASlug === "native" ? Native.onChain(chainId) : bscTokens[tokenASlug];
  const swapTo =
    tokenBSlug === "native" ? Native.onChain(chainId) : bscTokens[tokenBSlug];
  const amount = CurrencyAmount.fromRawAmount(swapFrom, amountA * 10 ** 18);

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(process.env.BSC_MAINNET_RPC_URL),
    batch: {
      multicall: {
        batchSize: 1024 * 200,
      },
    },
  });

  const v3SubgraphClient = new GraphQLClient(
    "https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc"
  );
  const v2SubgraphClient = new GraphQLClient(
    "https://proxy-worker-api.pancakeswap.com/bsc-exchange"
  );

  const quoteProvider = SmartRouter.createQuoteProvider({
    onChainProvider: () => publicClient as any,
  });

  const [v2Pools, v3Pools] = await Promise.all([
    SmartRouter.getV2CandidatePools({
      onChainProvider: () => publicClient as any,
      v2SubgraphProvider: () => v2SubgraphClient as any,
      v3SubgraphProvider: () => v3SubgraphClient as any,
      currencyA: amount.currency,
      currencyB: swapTo,
    }),
    SmartRouter.getV3CandidatePools({
      onChainProvider: () => publicClient as any,
      subgraphProvider: () => v3SubgraphClient as any,
      currencyA: amount.currency,
      currencyB: swapTo,
    }),
  ]);
  const pools = [...v2Pools, ...v3Pools];
  const trade = await SmartRouter.getBestTrade(
    amount,
    swapTo,
    TradeType.EXACT_INPUT,
    {
      gasPriceWei: () => publicClient.getGasPrice(),
      maxHops: 2,
      maxSplits: 2,
      poolProvider: SmartRouter.createStaticPoolProvider(pools),
      quoteProvider,
      quoterOptimization: true,
    }
  );

  if (!trade) {
    return null;
  }
  const { value: val, calldata: cData } = SwapRouter.swapCallParameters(trade, {
    recipient: signer.address as any,
    slippageTolerance: new Percent(1),
  });

  const swapCallParams = {
    address: SMART_ROUTER_ADDRESSES[chainId],
    calldata: cData,
    value: val,
  };

  if (!swapCallParams || !signer.address) {
    return;
  }

  const { value, calldata, address: routerAddress } = swapCallParams;

  function calculateGasMargin(value: bigint, margin = 1000n): bigint {
    return (value * (10000n + margin)) / 10000n;
  }

  if (swapFrom.isToken) {
    const swapFromERC20: Erc20 = new Contract(
      swapFrom.address,
      erc20ABI,
      provider
    ) as BaseContract as Erc20;

    const allowance = await swapFromERC20.allowance(
      signer.address,
      routerAddress
    );
    if (allowance >= BigInt(amountA * 10 ** 18)) {
      const tx = await swapFromERC20
        .connect(signer)
        .approve(routerAddress, BigInt(amountA * 10 ** 18));
      console.log({ tx });
    }
  }

  const tx = {
    account: signer.address as any,
    to: routerAddress,
    data: calldata,
    value: hexToBigInt(value),
  };
  const gasEstimate = await publicClient.estimateGas(tx);
  await signer.sendTransaction({
    from: signer.address,
    to: routerAddress,
    data: calldata,
    value: hexToBigInt(value),
    gasLimit: calculateGasMargin(gasEstimate),
  });
}
main();
