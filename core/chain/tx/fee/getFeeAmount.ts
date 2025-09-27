import { Chain, UtxoChain } from '@core/chain/Chain'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'

import { cosmosGasLimitRecord } from '../../chains/cosmos/cosmosGasLimitRecord'
import { polkadotConfig } from '../../chains/polkadot/config'
import { solanaConfig } from '../../chains/solana/solanaConfig'
import { suiAverageSendGas } from '../../chains/sui/config'
import { tonConfig } from '../../chains/ton/config'
import { rippleTxFee } from './ripple'
import { nativeTxFeeRune } from './thorchain/config'
import { getUTXOBasedFee } from './utxo/getUTXOBasedFee'

type GetFeeAmountInput = {
  chainSpecific: KeysignChainSpecific
  utxoInfo?: Array<{ hash: string; amount: bigint; index: number }> | null
  amount?: bigint | null // The amount being sent
  chain?: Chain
}

export const getFeeAmount = ({
  chainSpecific,
  utxoInfo,
  amount,
  chain,
}: GetFeeAmountInput): bigint =>
  matchDiscriminatedUnion(chainSpecific, 'case', 'value', {
    utxoSpecific: ({ byteFee, sendMaxAmount }) => {
      if (
        utxoInfo &&
        utxoInfo.length > 0 &&
        chain &&
        amount !== undefined &&
        amount !== null
      ) {
        return getUTXOBasedFee({
          utxoInfo,
          amount,
          byteFee: Number(byteFee),
          chain: chain as UtxoChain,
          sendMaxAmount,
        })
      }

      return BigInt(byteFee) * BigInt(250) // assume the average size of an UTXO transaction is 250 vbytes
    },
    ethereumSpecific: ({ maxFeePerGasWei, gasLimit }) =>
      BigInt(maxFeePerGasWei) * BigInt(gasLimit),
    suicheSpecific: ({ referenceGasPrice }) =>
      BigInt(referenceGasPrice) * suiAverageSendGas,
    solanaSpecific: ({ priorityFee }) =>
      BigInt(priorityFee) == BigInt(0)
        ? BigInt(solanaConfig.priorityFeeLimit)
        : BigInt(priorityFee), // currently we hardcode the priority fee to 100_000 lamports
    thorchainSpecific: ({ fee }) => BigInt(fee ?? nativeTxFeeRune),
    mayaSpecific: () => BigInt(cosmosGasLimitRecord[Chain.MayaChain]),
    cosmosSpecific: ({ gas }) =>
      BigInt(gas ?? cosmosGasLimitRecord[Chain.Cosmos]),
    polkadotSpecific: () => polkadotConfig.fee,
    tonSpecific: () => tonConfig.fee,
    tronSpecific: ({ gasEstimation }) => BigInt(gasEstimation || 0),
    rippleSpecific: () => rippleTxFee,
    cardano: ({ byteFee }) => BigInt(byteFee),
  })
