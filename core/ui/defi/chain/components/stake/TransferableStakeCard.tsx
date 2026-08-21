import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Coin, extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { ComponentProps } from 'react'

import { StakeCard } from './StakeCard'

type TransferableStakeCardProps = Omit<
  ComponentProps<typeof StakeCard>,
  'transferAmount'
> & {
  transferCoin: Coin
}

/**
 * Stake card whose Transfer button is labelled with the balance the send flow
 * will actually move. Receipt-backed positions need this: the auto-compounding
 * RUJI card shows a RUJI-denominated amount while Transfer sends sRUJI shares,
 * so the label has to come from the receipt balance rather than the card's own
 * amount. Until the balance resolves the button falls back to a bare "Transfer".
 */
export const TransferableStakeCard = ({
  transferCoin,
  ...props
}: TransferableStakeCardProps) => {
  const address = useCurrentVaultAddress(transferCoin.chain)
  const { data } = useBalanceQuery({
    ...extractCoinKey(transferCoin),
    address,
  })

  return (
    <StakeCard {...props} transferCoin={transferCoin} transferAmount={data} />
  )
}
