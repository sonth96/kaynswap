import { BaseContract, ethers } from "ethers";
import dotenv from "dotenv";
import { erc20ABI } from "@wagmi/core";
import { Erc20 } from "./types/Erc20.js";
import  merlinswapAbi  from "./abi/merlinswap/IMerlinSwap.json";
import { IMerlinSwap } from "./types/merlinswap/IMerlinSwap.js";
import { ADDRESS_ZERO } from "@uniswap/v3-sdk";
dotenv.config();

async function main() {
  const args = process.argv;
  const tokenAIndex = args.indexOf("tokenA");
  const tokenBIndex = args.indexOf("tokenB");
  const amountIndex = args.indexOf("amount");
  const feeIndex = args.indexOf("fee");
  const chainId = args.indexOf("chainId");
  if (tokenAIndex < 0 || tokenBIndex < 0 || amountIndex < 0 || chainId < 0 || feeIndex < 0) {
    console.log("Please provide swap arguments");
    return;
  }

  const tokenA = args[tokenAIndex + 1];
  const tokenB = args[tokenBIndex + 1];
  const fee = args[feeIndex + 1];
  const amount = Number(args[amountIndex + 1]);

  if (amount <= 0) {
    console.log("Amount > 0");
    return;
  }
  await swap(tokenA, tokenB, Number(fee), amount);
}

async function swap(
tokenXAddress: string,
tokenYAddress: string,
  fee: number,
  amountA: number
) {
  const rpcUrl = "https://merlin.blockpi.network/v1/rpc/public";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const bal = await provider.getBalance(signer.address);
  console.log("User balance " + bal.toString());
  const merlinSwapAddress= '0x1aFa5D7f89743219576Ef48a9826261bE6378a68';
  const merlinSwap = new ethers.Contract(
    merlinSwapAddress,
    merlinswapAbi,
    provider
  ) as BaseContract as IMerlinSwap;
  const tokenX = new ethers.Contract(
    tokenXAddress,
    erc20ABI,
    provider
  ) as BaseContract as Erc20;
  
  const allowaneA = await tokenX.allowance(
    signer.address,
    merlinSwapAddress
  );
  const decimalX = await tokenX.decimals();
  const amountASwap = BigInt(amountA * Math.pow(10, Number(decimalX)));
  await tokenX
        .connect(signer)
        .approve(merlinSwap, allowaneA + amountASwap);
  const pool = await merlinSwap.pool(tokenXAddress,tokenYAddress, BigInt(fee));
  if( pool!== ADDRESS_ZERO){
    const tx = await merlinSwap.connect(signer).swapX2Y({
        tokenX: tokenXAddress,
        tokenY: tokenYAddress,
        amount: BigInt(amountA),
        fee: BigInt(fee),
        recipient: signer.address,
        maxPayed: BigInt(amountA),
        deadline: new Date().getSeconds() + (5 * 60),
        boundaryPt: BigInt(0),
        minAcquired: BigInt(0)
     });
     console.log(tx);
  }

}
main();
