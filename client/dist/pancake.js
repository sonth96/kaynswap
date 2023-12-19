"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const viem_1 = require("viem");
const core_1 = require("@wagmi/core");
const smart_router_1 = require("@pancakeswap/smart-router");
const graphql_request_1 = require("graphql-request");
const sdk_1 = require("@pancakeswap/sdk");
const tokens_1 = require("@pancakeswap/tokens");
dotenv_1.default.config();
async function main() {
    const args = process.argv;
    const tokenAIndex = args.indexOf("tokenA");
    const tokenBIndex = args.indexOf("tokenB");
    const amountIndex = args.indexOf("amount");
    if (tokenAIndex < 0 || tokenBIndex < 0 || amountIndex < 0) {
        console.log("Please provide swap arguments");
        return;
    }
    const tokenA = args[tokenAIndex + 1];
    const tokenB = args[tokenBIndex + 1];
    const amount = Number(args[amountIndex + 1]);
    if (amount <= 0) {
        console.log("Amount > 0");
        return;
    }
    await swap(tokenA, tokenB, amount);
}
async function swap(tokenASlug, tokenBSlug, amountA) {
    const provider = new ethers_1.ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
    const signer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const chainId = sdk_1.ChainId.BSC;
    const swapFrom = tokens_1.bscTokens[tokenASlug];
    const swapTo = tokens_1.bscTokens[tokenBSlug];
    const amount = sdk_1.CurrencyAmount.fromRawAmount(swapFrom, amountA * 10 ** 18);
    const publicClient = (0, viem_1.createPublicClient)({
        chain: core_1.mainnet,
        transport: (0, viem_1.http)("https://bsc-dataseed1.binance.org"),
        batch: {
            multicall: {
                batchSize: 1024 * 200,
            },
        },
    });
    const v3SubgraphClient = new graphql_request_1.GraphQLClient("https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc");
    const v2SubgraphClient = new graphql_request_1.GraphQLClient("https://proxy-worker-api.pancakeswap.com/bsc-exchange");
    const quoteProvider = smart_router_1.SmartRouter.createQuoteProvider({
        onChainProvider: () => publicClient,
    });
    const [v2Pools, v3Pools] = await Promise.all([
        smart_router_1.SmartRouter.getV2CandidatePools({
            onChainProvider: () => publicClient,
            v2SubgraphProvider: () => v2SubgraphClient,
            v3SubgraphProvider: () => v3SubgraphClient,
            currencyA: amount.currency,
            currencyB: swapTo,
        }),
        smart_router_1.SmartRouter.getV3CandidatePools({
            onChainProvider: () => publicClient,
            subgraphProvider: () => v3SubgraphClient,
            currencyA: amount.currency,
            currencyB: swapTo,
        }),
    ]);
    const pools = [...v2Pools, ...v3Pools];
    const trade = await smart_router_1.SmartRouter.getBestTrade(amount, swapTo, sdk_1.TradeType.EXACT_INPUT, {
        gasPriceWei: () => publicClient.getGasPrice(),
        maxHops: 2,
        maxSplits: 2,
        poolProvider: smart_router_1.SmartRouter.createStaticPoolProvider(pools),
        quoteProvider,
        quoterOptimization: true,
    });
    if (!trade) {
        return null;
    }
    const { value: val, calldata: cData } = smart_router_1.SwapRouter.swapCallParameters(trade, {
        recipient: signer.address,
        slippageTolerance: new sdk_1.Percent(1),
    });
    const swapCallParams = {
        address: smart_router_1.SMART_ROUTER_ADDRESSES[chainId],
        calldata: cData,
        value: val,
    };
    if (!swapCallParams || !signer.address) {
        return;
    }
    const { value, calldata, address: routerAddress } = swapCallParams;
    function calculateGasMargin(value, margin = 1000n) {
        return (value * (10000n + margin)) / 10000n;
    }
    const tx = {
        account: signer.address,
        to: routerAddress,
        data: calldata,
        value: (0, viem_1.hexToBigInt)(value),
    };
    const gasEstimate = await publicClient.estimateGas(tx);
    await (0, core_1.sendTransaction)({
        account: signer.address,
        chainId,
        to: routerAddress,
        data: calldata,
        value: (0, viem_1.hexToBigInt)(value),
        gas: calculateGasMargin(gasEstimate),
    });
}
main();
