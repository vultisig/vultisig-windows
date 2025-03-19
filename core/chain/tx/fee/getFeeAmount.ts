import { Chain } from '@core/chain/Chain'
import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { polkadotConfig } from '@core/chain/chains/polkadot/config'
import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { tonConfig } from '@core/chain/chains/ton/config'
import { rippleTxFee } from '@core/chain/tx/fee/ripple'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'

export const getFeeAmount = (chainSpecific: KeysignChainSpecific): bigint =>
  matchDiscriminatedUnion(chainSpecific, 'case', 'value', {
    utxoSpecific: ({ byteFee }) => BigInt(byteFee) * BigInt(250), // assume the average size of an UTXO transaction is 250 vbytes
    ethereumSpecific: ({ maxFeePerGasWei, gasLimit }) =>
      BigInt(maxFeePerGasWei) * BigInt(gasLimit),
    suicheSpecific: ({ referenceGasPrice }) => BigInt(referenceGasPrice),
    solanaSpecific: ({ priorityFee }) =>
      BigInt(priorityFee) == BigInt(0)
        ? BigInt(solanaConfig.priorityFeeLimit)
        : BigInt(priorityFee), // currently we hardcode the priority fee to 100_000 lamports
    thorchainSpecific: ({ fee }) => BigInt(fee),
    mayaSpecific: () => BigInt(cosmosGasLimitRecord[Chain.MayaChain]),
    cosmosSpecific: ({ gas }) => BigInt(gas),
    polkadotSpecific: () => polkadotConfig.fee,
    tonSpecific: () => tonConfig.fee,
    tronSpecific: ({ gasEstimation }) => BigInt(gasEstimation || 0),
    rippleSpecific: () => rippleTxFee,
  })
