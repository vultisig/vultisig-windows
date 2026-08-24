import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { KaminoSharePosition } from '@vultisig/core-chain/chains/solana/kamino/position'
import { KaminoWithdrawRequest } from '@vultisig/core-chain/chains/solana/kamino/tx/validate'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'

import { kaminoUnderlyingCoin } from '../underlyingCoin'
import { KaminoWithdrawForm } from './KaminoWithdrawForm'
import { KaminoWithdrawVerify } from './KaminoWithdrawVerify'

type KaminoWithdrawFlowProps = {
  vault: KaminoVaultInfo
  position: KaminoSharePosition
  /** The holder's Solana address. */
  owner: string
}

/**
 * The two steps of a withdrawal from one vault, sharing the coin and its price
 * so the amount the form bounds is the amount the review screen prices.
 */
export const KaminoWithdrawFlow = ({
  vault,
  position,
  owner,
}: KaminoWithdrawFlowProps) => {
  const coin = { ...kaminoUnderlyingCoin(vault.descriptor), address: owner }
  const pricesQuery = useCoinPricesQuery({ coins: [coin] })
  const priceUsd =
    pricesQuery.data?.[coinKeyToString({ chain: coin.chain, id: coin.id })] ?? 0

  return (
    <ValueTransfer<KaminoWithdrawRequest>
      from={({ onFinish }) => (
        <KaminoWithdrawForm
          vault={vault}
          coin={coin}
          position={position}
          priceUsd={priceUsd}
          onFinish={onFinish}
        />
      )}
      to={({ value, onBack }) => (
        <KaminoWithdrawVerify
          vault={vault}
          coin={coin}
          request={value}
          priceUsd={priceUsd}
          onBack={onBack}
        />
      )}
    />
  )
}
