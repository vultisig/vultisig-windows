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

// Not a clean solution but needed because the 'ETH' token comes with the wrong logo for some EVM chains, where the logo is the governance token logo, whereas it still has to be the ETH logo.
export const isETHGasTokenAndNotGovernanceToken = ({
  chain,
  ticker,
}: {
  chain: Chain;
  ticker: string;
}) => {
  return (
    ticker === ETHTicker &&
    chainsWithDifferentGovernanceAndGasTokens.includes(chain)
  );
};
