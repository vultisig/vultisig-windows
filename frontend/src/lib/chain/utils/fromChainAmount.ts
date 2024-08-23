export const fromChainAmount = (amount: string | number, decimals: number) => {
  return Number(amount) / Math.pow(10, decimals);
};
