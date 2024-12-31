import { matchDiscriminatedUnion } from '../../../../lib/utils/matchDiscriminatedUnion';
import { KeysignChainSpecific } from '../../../keysign/KeysignChainSpecific';
import { mayaConfig } from '../../../maya/config';
import { polkadotConfig } from '../../../polkadot/config';
import { rippleConfig } from '../../../ripple/config';
import { tonConfig } from '../../../ton/config';

export const getFeeAmount = (chainSpecific: KeysignChainSpecific): number =>
  matchDiscriminatedUnion(chainSpecific, 'case', 'value', {
    utxoSpecific: ({ byteFee }) => Number(byteFee),
    ethereumSpecific: ({ maxFeePerGasWei }) => Number(maxFeePerGasWei),
    suicheSpecific: ({ referenceGasPrice }) => Number(referenceGasPrice),
    solanaSpecific: ({ priorityFee }) => Number(priorityFee),
    thorchainSpecific: ({ fee }) => Number(fee),
    mayaSpecific: () => mayaConfig.fee,
    cosmosSpecific: ({ gas }) => Number(gas),
    polkadotSpecific: () => polkadotConfig.fee,
    tonSpecific: () => Number(tonConfig.fee),
    rippleSpecific: () => rippleConfig.fee,
  });
