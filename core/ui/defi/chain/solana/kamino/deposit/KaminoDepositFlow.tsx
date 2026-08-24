import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { KaminoTokenAmount } from '@vultisig/core-chain/chains/solana/kamino/amount'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'

import { kaminoUnderlyingCoin } from '../underlyingCoin'
import { KaminoDepositForm } from './KaminoDepositForm'
import { KaminoDepositVerify } from './KaminoDepositVerify'

type KaminoDepositFlowProps = {
  vault: KaminoVaultInfo
  /** The depositor's Solana address. */
  owner: string
}

/**
 * The two steps of a deposit into one vault, sharing the coin and its price so
 * the amount the form bounds is the amount the review screen prices.
 */
export const KaminoDepositFlow = ({ vault, owner }: KaminoDepositFlowProps) => {
  const coin = { ...kaminoUnderlyingCoin(vault.descriptor), address: owner }
  const pricesQuery = useCoinPricesQuery({ coins: [coin] })
  const priceUsd =
    pricesQuery.data?.[coinKeyToString({ chain: coin.chain, id: coin.id })] ?? 0

  return (
    <ValueTransfer<KaminoTokenAmount>
      from={({ onFinish }) => (
        <KaminoDepositForm
          vault={vault}
          coin={coin}
          priceUsd={priceUsd}
          onFinish={onFinish}
        />
      )}
      to={({ value, onBack }) => (
        <KaminoDepositVerify
          vault={vault}
          coin={coin}
          amount={value}
          priceUsd={priceUsd}
          onBack={onBack}
        />
      )}
    />
  )
}
