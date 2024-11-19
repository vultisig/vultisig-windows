export const fromChainAmount = (amount: bigint | number, decimals: number) => {
  return Number(amount) / Math.pow(10, decimals);
};
