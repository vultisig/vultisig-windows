import { UtxoChain } from '@core/chain/Chain'
import { getUtxoStats } from '@core/chain/chains/utxo/client/getUtxoStats'

const byteFeeMultiplier = (value: bigint) => (value * 25n) / 10n

export const getUtxoByteFee = async (chain: UtxoChain) => {
  if (chain === UtxoChain.Zcash) return 1000n

  const {
    data: { suggested_transaction_fee_per_byte_sat },
  } = await getUtxoStats(chain)

  const base = BigInt(suggested_transaction_fee_per_byte_sat)

  if (chain === UtxoChain.Dogecoin) {
    // According to iOS codebase
    //// For DOGE, the API returns 500k sats/byte which is too high for WalletCore
    // Use a much lower value that WalletCore can work with: divide by 10
    return base / 10n
  }

  return byteFeeMultiplier(BigInt(suggested_transaction_fee_per_byte_sat))
}
