import { Coin as CoinPB } from '../gen/vultisig/keysign/v1/coin_pb';

function sortedStringify(obj: any): string {
  const ordered: any = {};
  Object.keys(obj)
    .sort()
    .forEach(key => {
      ordered[key] = obj[key];
    });
  return JSON.stringify(ordered);
}

export function compareCoins(storedCoin: CoinPB, targetCoin: CoinPB): boolean {
  const storedCoinString = sortedStringify(storedCoin);
  const targetCoinString = sortedStringify(targetCoin);
  return storedCoinString === targetCoinString;
}
