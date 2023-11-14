"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const erc20_json_1 = __importDefault(require("./abi/erc20.json"));
const kayswap_factory_json_1 = __importDefault(require("./abi/kayswap_factory.json"));
const kayswap_pool_json_1 = __importDefault(require("./abi/kayswap_pool.json"));
dotenv_1.default.config();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
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
        yield swap(tokenA, tokenB, amount);
    });
}
function generateFunctionSignature(functionSignature) {
    const functionSignatureHash = ethers_1.ethers.id(functionSignature).slice(0, 10);
    // output results
    console.log(`Function: ${functionSignature}`);
    console.log(`Function signature: ${functionSignatureHash}`);
    return functionSignatureHash;
}
function swap(tokenAAddress, tokenBAddress, amountA) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
        const signer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const tokenA = new ethers_1.ethers.Contract(tokenAAddress, erc20_json_1.default, provider);
        const tokenB = new ethers_1.ethers.Contract(tokenBAddress, erc20_json_1.default, provider);
        const kayswapFactoryAddress = "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654";
        try {
            const KayswapFactory = new ethers_1.ethers.Contract(kayswapFactoryAddress, kayswap_factory_json_1.default, provider);
            const allowaneA = yield tokenA.allowance(signer.address, kayswapFactoryAddress);
            const decimalA = yield tokenA.decimals();
            const decimalB = yield tokenB.decimals();
            const amountASwap = BigInt(amountA * Math.pow(10, Number(decimalA)));
            yield tokenA
                .connect(signer)
                .approve(kayswapFactoryAddress, allowaneA + amountASwap);
            const pool = yield KayswapFactory.tokenToPool(tokenAAddress, tokenBAddress);
            console.log(pool);
            if (pool === ethers_1.ZeroAddress)
                return;
            const KayswapPool = new ethers_1.ethers.Contract(pool, kayswap_pool_json_1.default, provider);
            const estimatedBOut = yield KayswapPool.estimatePos(tokenAAddress, amountASwap);
            console.log({ tokenAAddress, tokenBAddress, amountASwap, estimatedBOut });
            yield KayswapFactory.connect(signer).exchangeKctPos(tokenAAddress, amountASwap, tokenBAddress, estimatedBOut, []);
            console.log(`Successfully swap ${tokenAAddress} to ${estimatedBOut / BigInt(10) ** decimalB} ${tokenBAddress}`);
        }
        catch (error) {
            console.error(error);
        }
    });
}
main();
