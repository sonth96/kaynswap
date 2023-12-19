"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const erc20_json_1 = __importDefault(require("./abi/kayswap/erc20.json"));
const kayswap_factory_json_1 = __importDefault(require("./abi/kayswap/kayswap_factory.json"));
const kayswap_pool_json_1 = __importDefault(require("./abi/kayswap/kayswap_pool.json"));
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
async function swap(tokenAAddress, tokenBAddress, amountA) {
    const provider = new ethers_1.ethers.JsonRpcProvider(process.env.KAYTN_MAINNET_RPC_URL);
    const signer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const tokenA = new ethers_1.ethers.Contract(tokenAAddress, erc20_json_1.default, provider);
    const tokenB = new ethers_1.ethers.Contract(tokenBAddress, erc20_json_1.default, provider);
    const kayswapFactoryAddress = "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654";
    try {
        const KayswapFactory = new ethers_1.ethers.Contract(kayswapFactoryAddress, kayswap_factory_json_1.default, provider);
        /// KAYN
        if (tokenAAddress === ethers_1.ZeroAddress) {
            const amountASwap = BigInt(amountA * Math.pow(10, Number(18)));
            const pool = await KayswapFactory.tokenToPool(tokenAAddress, tokenBAddress);
            if (pool === ethers_1.ZeroAddress)
                return;
            const KayswapPool = new ethers_1.ethers.Contract(pool, kayswap_pool_json_1.default, provider);
            const estimatedBOut = await KayswapPool.estimatePos(tokenAAddress, amountASwap);
            console.log({ tokenAAddress, tokenBAddress, amountASwap, estimatedBOut });
            const tx = await KayswapFactory.connect(signer).exchangeKlayPos(tokenBAddress, estimatedBOut, [], {
                value: amountASwap,
            });
            console.log(`Successfully swap ${tokenAAddress} to ${tokenBAddress} tx:${tx}`);
        }
        else {
            const allowaneA = await tokenA.allowance(signer.address, kayswapFactoryAddress);
            const decimalA = await tokenA.decimals();
            const decimalB = await tokenB.decimals();
            const amountASwap = BigInt(amountA * Math.pow(10, Number(decimalA)));
            await tokenA
                .connect(signer)
                .approve(kayswapFactoryAddress, allowaneA + amountASwap);
            const pool = await KayswapFactory.tokenToPool(tokenAAddress, tokenBAddress);
            console.log(pool);
            if (pool === ethers_1.ZeroAddress)
                return;
            const KayswapPool = new ethers_1.ethers.Contract(pool, kayswap_pool_json_1.default, provider);
            const estimatedBOut = await KayswapPool.estimatePos(tokenAAddress, amountASwap);
            console.log({ tokenAAddress, tokenBAddress, amountASwap, estimatedBOut });
            await KayswapFactory.connect(signer).exchangeKctPos(tokenAAddress, amountASwap, tokenBAddress, estimatedBOut, []);
            console.log(`Successfully swap ${tokenAAddress} to ${estimatedBOut / BigInt(10) ** decimalB} ${tokenBAddress}`);
        }
    }
    catch (error) {
        console.error(error);
    }
}
main();
