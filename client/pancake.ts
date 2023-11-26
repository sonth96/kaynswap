import { BaseContract, ethers, ZeroAddress } from "ethers";
import dotenv from "dotenv";
import ERC20Abi from "./abi/erc20/erc20.json";
import SmartRouterAbi from "./abi/pancake/smart_router.json";
import { Erc20, Smart_router } from "./types";
import { IV3SwapRouter } from "./types/pancake/Smart_router";
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

  const tokenA = args[tokenAIndex + 1];
  const tokenB = args[tokenBIndex + 1];
  const amount = Number(args[amountIndex + 1]);

  if (amount <= 0) {
    console.log("Amount > 0");
    return;
  }
  await swap(tokenA, tokenB, amount);
}

async function swap(
  tokenAAddress: string,
  tokenBAddress: string,
  amountA: number
) {
  const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const tokenA = new ethers.Contract(
    tokenAAddress,
    ERC20Abi,
    provider
  ) as BaseContract as Erc20;

  const pancakeSmartRouterBSCAddress =
    "0x13f4ea83d0bd40e75c8222255bc855a974568dd4";

  try {
    const smartRouter = new ethers.Contract(
      pancakeSmartRouterBSCAddress,
      SmartRouterAbi,
      provider
    ) as BaseContract as Smart_router;

    /// Native token
    let WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    if (tokenAAddress === WBNB) {
      const amountASwap = BigInt(amountA * Math.pow(10, Number(18)));
      const tx = await smartRouter.connect(signer).exactInputSingle(
        {
          tokenIn: tokenAAddress,
          tokenOut: tokenBAddress,
          fee: BigInt(0),
          recipient: signer.address,
          amountIn: amountA,
          amountOutMinimum: BigInt(0),
          sqrtPriceLimitX96: BigInt(0),
        } as IV3SwapRouter.ExactInputSingleParamsStruct,
        {
          value: amountASwap,
        }
      );

      console.log({ tokenAAddress, tokenBAddress, amountASwap });

      console.log(
        `Successfully swap ${tokenAAddress} to ${tokenBAddress} tx:${tx}`
      );
    } else {
      const allowaneA = await tokenA.allowance(
        signer.address,
        pancakeSmartRouterBSCAddress
      );
      const decimalA = await tokenA.decimals();
      const amountASwap = BigInt(amountA * Math.pow(10, Number(decimalA)));

      await tokenA
        .connect(signer)
        .approve(pancakeSmartRouterBSCAddress, allowaneA + amountASwap);

      const tx = await smartRouter.connect(signer).exactInputSingle({
        tokenIn: tokenAAddress,
        tokenOut: tokenBAddress,
        fee: BigInt(0),
        recipient: signer.address,
        amountIn: amountA,
        amountOutMinimum: BigInt(0),
        sqrtPriceLimitX96: BigInt(0),
      } as IV3SwapRouter.ExactInputSingleParamsStruct);
    }
  } catch (error) {
    console.error(error);
  }
}
main();
