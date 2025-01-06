import { matchDiscriminatedUnion } from '../../../../lib/utils/matchDiscriminatedUnion';
import { KeysignChainSpecific } from '../../../keysign/KeysignChainSpecific';
import { mayaConfig } from '../../../maya/config';
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
    mayaSpecific: () => mayaConfig.fee,
    cosmosSpecific: ({ gas }) => BigInt(gas),
    polkadotSpecific: () => polkadotConfig.fee,
    tonSpecific: () => tonConfig.fee,
    rippleSpecific: () => rippleConfig.fee,
  });
