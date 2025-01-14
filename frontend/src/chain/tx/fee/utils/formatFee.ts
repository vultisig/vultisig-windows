import { isOneOf } from '../../../../lib/utils/array/isOneOf';
import { formatAmount } from '../../../../lib/utils/formatAmount';
import { matchDiscriminatedUnion } from '../../../../lib/utils/matchDiscriminatedUnion';
import { Chain, EvmChain } from '../../../../model/chain';
import { KeysignChainSpecific } from '../../../keysign/KeysignChainSpecific';
import { mayaConfig } from '../../../maya/config';
import { polkadotConfig } from '../../../polkadot/config';
import { rippleConfig } from '../../../ripple/config';
import { tonConfig } from '../../../ton/config';
import { fromChainAmount } from '../../../utils/fromChainAmount';
import { gwei } from './evm';
import { getFeeUnit } from './feeUnit';
import { getChainFeeCoin } from './getChainFeeCoin';

type FormatFeeInput = {
  chain: Chain;
  chainSpecific: KeysignChainSpecific;
};

export const formatFee = ({ chain, chainSpecific }: FormatFeeInput) => {
  const feeAmount: bigint = matchDiscriminatedUnion(
    chainSpecific,
    'case',
    'value',
    {
      utxoSpecific: ({ byteFee }) => BigInt(byteFee),
      ethereumSpecific: ({ maxFeePerGasWei }) => BigInt(maxFeePerGasWei),
      suicheSpecific: ({ referenceGasPrice }) => BigInt(referenceGasPrice),
      solanaSpecific: ({ priorityFee }) => BigInt(priorityFee),
      thorchainSpecific: ({ fee }) => BigInt(fee),
      mayaSpecific: () => mayaConfig.fee,
      cosmosSpecific: ({ gas }) => BigInt(gas),
      polkadotSpecific: () => polkadotConfig.fee,
      tonSpecific: () => tonConfig.fee,
      rippleSpecific: () => rippleConfig.fee,
    }
  );

  const decimals = isOneOf(chain, Object.values(EvmChain))
    ? gwei.decimals
    : getChainFeeCoin(chain).decimals;

  const amount = fromChainAmount(feeAmount, decimals);

  return formatAmount(amount, getFeeUnit(chain));
};
