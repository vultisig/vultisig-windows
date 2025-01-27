import { chainFeeCoin } from '../../../coin/chainFeeCoin';
import { Chain } from '../../../model/chain';

const chainsWithDifferentGovernanceAndGasTokens: Chain[] = [
  Chain.Arbitrum,
  Chain.Optimism,
  Chain.Base,
  Chain.Zksync,
  Chain.Blast,
];

const ETHTicker = chainFeeCoin[Chain.Ethereum].ticker;

export const shouldDisplayChainLogo = ({
  ticker,
  chain,
  isNative,
}: {
  ticker: string;
  chain: Chain;
  isNative: boolean;
}): boolean => {
  return (
    !isNative ||
    (ticker === ETHTicker &&
      chainsWithDifferentGovernanceAndGasTokens.includes(chain))
  );
};
