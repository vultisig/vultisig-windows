export type CoinKey = {
  chainId: string;
  id: string;
};

export type CoinAmount = {
  amount: number;
  decimals: number;
};

export type CoinInfo = {
  name: string;
  symbol: string;
  icon?: string;
};
