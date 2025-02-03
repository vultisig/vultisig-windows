import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion';
import { Chain } from '../../../../model/chain';
import { cosmosGasLimitRecord } from '../../../cosmos/cosmosGasLimitRecord';
import { KeysignChainSpecific } from '../../../keysign/KeysignChainSpecific';
import { polkadotConfig } from '../../../polkadot/config';
import { rippleConfig } from '../../../ripple/config';
import { tonConfig } from '../../../ton/config';

export const getFeeAmount = (chainSpecific: KeysignChainSpecific): bigint =>
  matchDiscriminatedUnion(chainSpecific, 'case', 'value', {
    utxoSpecific: ({ byteFee }) => BigInt(byteFee),
    ethereumSpecific: ({ maxFeePerGasWei, gasLimit }) =>
      BigInt(maxFeePerGasWei) * BigInt(gasLimit),
    suicheSpecific: ({ referenceGasPrice }) => BigInt(referenceGasPrice),
    solanaSpecific: ({ priorityFee }) => BigInt(priorityFee),
    thorchainSpecific: ({ fee }) => BigInt(fee),
    mayaSpecific: () => BigInt(cosmosGasLimitRecord[Chain.MayaChain]),
    cosmosSpecific: ({ gas }) => BigInt(gas),
    polkadotSpecific: () => polkadotConfig.fee,
    tonSpecific: () => tonConfig.fee,
    rippleSpecific: () => rippleConfig.fee,
  });
