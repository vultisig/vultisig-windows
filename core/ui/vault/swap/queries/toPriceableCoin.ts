import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import {
  areEqualCoins,
  CoinKey,
  extractCoinKey,
} from '@vultisig/core-chain/coin/Coin'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'

type PriceableCoin = CoinKey & { priceProviderId?: string }

type ToPriceableCoinInput = {
  fee: SwapFee
  vaultCoins: AccountCoin[]
}

/**
 * The coin key a swap fee is priced through.
 *
 * A fee coin the vault holds carries its own `priceProviderId`. One it does not
 * hold still has to be priced: a native swap charges its fee in the destination
 * coin, and a signer approving the swap often has not added that coin yet.
 * Fees on those coins used to be dropped from the price lookup, which valued
 * them at zero and quietly shrank the total the signer was shown.
 *
 * The chain's fee coin supplies the provider id for a native fee coin. A token
 * the vault does not hold falls through on its key alone — no provider id is
 * invented for it — which is what the ERC-20 lookup wants anyway.
 */
export const toPriceableCoin = ({
  fee,
  vaultCoins,
}: ToPriceableCoinInput): PriceableCoin => {
  const vaultCoin = vaultCoins.find(coin => areEqualCoins(coin, fee))
  if (vaultCoin) return vaultCoin

  const key = extractCoinKey(fee)

  return key.id
    ? key
    : { ...key, priceProviderId: chainFeeCoin[key.chain].priceProviderId }
}
