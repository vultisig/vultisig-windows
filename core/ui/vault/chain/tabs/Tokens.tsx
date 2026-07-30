import { defaultRippleTrustLineLimit } from '@core/ui/chain/coin/ripple/trustLineLimit'
import { useTokensNeedingTrustLine } from '@core/ui/chain/coin/ripple/useTokensNeedingTrustLine'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { CoinDetailModal } from '@core/ui/vault/chain/coin/CoinDetailModal'
import { adjustVaultChainCoinsLogos } from '@core/ui/vault/chain/manage/coin/adjustVaultChainCoinsLogos'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { VaultChainCoinItem } from '@core/ui/vault/chain/VaultChainCoinItem'
import { useVaultChainCoinsQuery } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { getColor } from '@lib/ui/theme/getters'
import { parseRippleTokenId } from '@vultisig/core-chain/chains/ripple/issuedCurrency'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { sortCoinsByBalance } from '@vultisig/core-chain/coin/utils/sortCoinsByBalance'
import { splitBy } from '@vultisig/lib-utils/array/splitBy'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useDeferredValue, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSearchChainToken } from '../state/searchChainTokenProvider'

const StyledPanel = styled(Panel)`
  cursor: pointer;

  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`

export const Tokens = () => {
  const chain = useCurrentVaultChain()
  const vaultCoinsQuery = useVaultChainCoinsQuery(chain)
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const chainCoins = useCurrentVaultChainCoins(chain)
  const tokensNeedingTrustLine = useTokensNeedingTrustLine({
    chain,
    coins: chainCoins,
  })
  const [searchQuery] = useSearchChainToken()
  const deferredQuery = useDeferredValue(searchQuery)

  // Hands the token off to the existing Open Trust Line flow with the issuer,
  // currency and a default limit already filled in, so the shared verify ->
  // keysign path signs the TrustSet. The limit stays editable — it is the cap
  // the user is agreeing to hold.
  const activateTrustLine = (coin: CoinKey) => {
    const { currency, issuer } = parseRippleTokenId(shouldBePresent(coin.id))

    navigate({
      id: 'deposit',
      state: {
        coin: { chain, id: undefined },
        action: 'open_trust_line',
        form: { issuer, currency, amount: defaultRippleTrustLineLimit },
      },
    })
  }

  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const filteredCoinsQuery = useMemo(() => {
    if (!vaultCoinsQuery.data || !normalizedQuery) {
      return vaultCoinsQuery
    }

    const filteredCoins = vaultCoinsQuery.data.filter(coin =>
      coin.ticker?.toLowerCase().includes(normalizedQuery)
    )

    return {
      ...vaultCoinsQuery,
      data: filteredCoins,
    }
  }, [normalizedQuery, vaultCoinsQuery])

  return (
    <VStack gap={16} fullWidth>
      <MatchQuery
        value={filteredCoinsQuery}
        error={() => t('failed_to_load')}
        pending={() => (
          <VStack fullWidth>
            <Spinner />
          </VStack>
        )}
        success={coins => {
          const orderedCoins = withoutDuplicates(
            splitBy(coins, coin => (isFeeCoin(coin) ? 0 : 1))
              .map(sortCoinsByBalance)
              .flat(),
            (one, another) => one.ticker === another.ticker
          ).map(adjustVaultChainCoinsLogos)

          return (
            <List>
              {orderedCoins.map((coin, idx) =>
                coin.id && tokensNeedingTrustLine.has(coin.id) ? (
                  // No trust line yet, so there is no balance to drill into —
                  // the row offers the activation instead of the coin detail.
                  <StyledPanel
                    key={`${idx}-${coin.id}`}
                    onClick={() => activateTrustLine(coin)}
                  >
                    <VaultChainCoinItem
                      value={coin}
                      onActivate={() => activateTrustLine(coin)}
                    />
                  </StyledPanel>
                ) : (
                  <Opener
                    key={`${idx}-${coin.id}`}
                    renderOpener={({ onOpen }) => (
                      <StyledPanel onClick={onOpen}>
                        <VaultChainCoinItem value={coin} />
                      </StyledPanel>
                    )}
                    renderContent={({ onClose }) => (
                      <CoinDetailModal coin={coin} onClose={onClose} />
                    )}
                  />
                )
              )}
            </List>
          )
        }}
      />
    </VStack>
  )
}
