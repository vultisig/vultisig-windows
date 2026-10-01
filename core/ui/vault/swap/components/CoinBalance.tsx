import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useTransferDirection } from '@core/ui/state/transferDirection'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text, text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { match } from '@vultisig/lib-utils/match'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useFromAmount } from '../state/fromAmount'
const Container = styled.div`
  ${text({
    color: 'shy',
    weight: '700',
    size: 12,
    centerVertically: {
      gap: 8,
    },
  })}
`

/**
 * Balance of a swap card's coin. On the From card, tapping it fills the From
 * amount with the full balance; on the To card it is display-only, since the
 * To coin's balance means nothing as a From amount.
 */
export const CoinBalance = ({ value }: ValueProp<CoinKey>) => {
  const { t } = useTranslation()
  const coin = useCurrentVaultCoin(value)
  const query = useBalanceQuery(extractAccountCoinKey(coin))
  const [, setFromValue] = useFromAmount()
  const side = useTransferDirection()

  return (
    <Container>
      <MatchQuery
        value={query}
        pending={() => <Spinner />}
        error={() => t('failed_to_load')}
        success={amount => {
          const balance = (
            <Text as="span" size={12} color="shy" weight={500}>
              {formatAmount(fromChainAmount(amount, coin.decimals), coin)}
            </Text>
          )

          return match(side, {
            from: () => (
              <UnstyledButton onClick={() => setFromValue(amount)}>
                {balance}
              </UnstyledButton>
            ),
            to: () => balance,
          })
        }}
      />
    </Container>
  )
}
