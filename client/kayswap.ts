import { BaseContract, ethers, ZeroAddress } from "ethers";
import dotenv from "dotenv";
import ERC20Abi from "./abi/kayswap/erc20.json";
import KayswapFactoryAbi from "./abi/kayswap/kayswap_factory.json";
import KayswapPoolAbi from "./abi/kayswap/kayswap_pool.json";
import { Erc20, Kayswap_factory, Kayswap_pool } from "./types";
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
  const provider = new ethers.JsonRpcProvider(
    process.env.KAYTN_MAINNET_RPC_URL
  );
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const tokenA = new ethers.Contract(
    tokenAAddress,
    ERC20Abi,
    provider
  ) as BaseContract as Erc20;

  const tokenB = new ethers.Contract(
    tokenBAddress,
    ERC20Abi,
    provider
  ) as BaseContract as Erc20;

  const kayswapFactoryAddress = "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654";

  try {
    const KayswapFactory = new ethers.Contract(
      kayswapFactoryAddress,
      KayswapFactoryAbi,
      provider
    ) as BaseContract as Kayswap_factory;

    /// KAYN
    if (tokenAAddress === ZeroAddress) {
      const amountASwap = BigInt(amountA * Math.pow(10, Number(18)));
      const pool = await KayswapFactory.tokenToPool(
        tokenAAddress,
        tokenBAddress
      );
      if (pool === ZeroAddress) return;
      const KayswapPool = new ethers.Contract(
        pool,
        KayswapPoolAbi,
        provider
      ) as BaseContract as Kayswap_pool;

      const estimatedBOut = await KayswapPool.estimatePos(
        tokenAAddress,
        amountASwap
      );
      console.log({ tokenAAddress, tokenBAddress, amountASwap, estimatedBOut });

      const tx = await KayswapFactory.connect(signer).exchangeKlayPos(
        tokenBAddress,
        estimatedBOut,
        [],
        {
          value: amountASwap,
        }
      );
      console.log(
        `Successfully swap ${tokenAAddress} to ${tokenBAddress} tx:${tx}`
      );
    } else {
      const allowaneA = await tokenA.allowance(
        signer.address,
        kayswapFactoryAddress
      );
      const decimalA = await tokenA.decimals();
      const decimalB = await tokenB.decimals();
      const amountASwap = BigInt(amountA * Math.pow(10, Number(decimalA)));

      await tokenA
        .connect(signer)
        .approve(kayswapFactoryAddress, allowaneA + amountASwap);

      const pool = await KayswapFactory.tokenToPool(
        tokenAAddress,
        tokenBAddress
      );
      console.log(pool);
      if (pool === ZeroAddress) return;

      const KayswapPool = new ethers.Contract(
        pool,
        KayswapPoolAbi,
        provider
      ) as BaseContract as Kayswap_pool;

      const estimatedBOut = await KayswapPool.estimatePos(
        tokenAAddress,
        amountASwap
      );
      console.log({ tokenAAddress, tokenBAddress, amountASwap, estimatedBOut });

      await KayswapFactory.connect(signer).exchangeKctPos(
        tokenAAddress,
        amountASwap,
        tokenBAddress,
        estimatedBOut,
        []
      );
      console.log(
        `Successfully swap ${tokenAAddress} to ${
          estimatedBOut / BigInt(10) ** decimalB
        } ${tokenBAddress}`
      );
    }
  } catch (error) {
    console.error(error);
  }
}
main();
