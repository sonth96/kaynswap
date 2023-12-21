export const DEADLINE = Math.floor(
  (Date.now() / 1000) * (parseInt(process.env.DEADLINE_IN_MINUTES || "30") * 60)
);

export * from "./pancake";
export * from "./uniswap";
