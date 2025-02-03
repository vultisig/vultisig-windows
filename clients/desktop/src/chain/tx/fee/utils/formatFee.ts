import { isOneOf } from '@lib/utils/array/isOneOf';
import { formatAmount } from '@lib/utils/formatAmount';
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion';

import { chainFeeCoin } from '../../../../coin/chainFeeCoin';
import { Chain, EvmChain } from '../../../../model/chain';
import { cosmosGasLimitRecord } from '../../../cosmos/cosmosGasLimitRecord';
import { KeysignChainSpecific } from '../../../keysign/KeysignChainSpecific';
import { polkadotConfig } from '../../../polkadot/config';
import { rippleConfig } from '../../../ripple/config';
import { tonConfig } from '../../../ton/config';
import { fromChainAmount } from '../../../utils/fromChainAmount';
import { gwei } from './evm';
import { getFeeUnit } from './feeUnit';

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
      mayaSpecific: () => BigInt(cosmosGasLimitRecord[Chain.MayaChain]),
      cosmosSpecific: ({ gas }) => BigInt(gas),
      polkadotSpecific: () => polkadotConfig.fee,
      tonSpecific: () => tonConfig.fee,
      rippleSpecific: () => rippleConfig.fee,
    }
  );

  const decimals = isOneOf(chain, Object.values(EvmChain))
    ? gwei.decimals
    : chainFeeCoin[chain].decimals;

  const amount = fromChainAmount(feeAmount, decimals);

  return formatAmount(amount, getFeeUnit(chain));
};
