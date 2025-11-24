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
    // According to iOS implementation: For Dogecoin, the API responds with 500,000 sats/byte, which exceeds what WalletCore expects.
    // To ensure compatibility with WalletCore, we divide the API value by 10 to bring it into an acceptable range.
    return base / 10n
  }

  return byteFeeMultiplier(BigInt(suggested_transaction_fee_per_byte_sat))
}
