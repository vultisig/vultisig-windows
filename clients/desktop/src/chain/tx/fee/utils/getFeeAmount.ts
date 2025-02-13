import { Chain } from '@core/chain/Chain';
import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord';
import { rippleTxFee } from '@core/chain/tx/fee/ripple';
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion';

import { KeysignChainSpecific } from '../../../../../../../core/keysign/chainSpecific/KeysignChainSpecific';
import { polkadotConfig } from '../../../polkadot/config';
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
    rippleSpecific: () => rippleTxFee,
    tronSpecific: () => {
      throw new Error('Tron fee not implemented');
    },
  });
