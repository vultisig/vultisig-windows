import { CoinOption } from '@core/ui/chain/coin/inputs/CoinOption'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { VStack } from '@lib/ui/layout/Stack'
import { SearchField } from '@lib/ui/search/SearchField'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { areEqualCoins, coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSendAssetFilter } from '../../state/assetFilter'
import { useSendFormFieldState } from '../../state/formFields'
import { useCurrentSendCoin } from '../../state/sendCoin'
import { useSetSendCoin } from '../../state/useSetSendCoin'
import { SendChainFilterButton } from './SendChainFilterButton'
import { useSendAssetListing } from './useSendAssetListing'

const blurFocusedField = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}

/**
 * The send asset step: a search over every chain, a chain filter and the
 * vault's coins. Picking a coin moves on to the address step.
 */
export const SendAssetStep = () => {
  const { t } = useTranslation()
  const [{ chain, query }, setFilter] = useSendAssetFilter()
  const [, setStep] = useSendFormFieldState()
  const setCoin = useSetSendCoin()
  const { coins } = useSendAssetListing({ filter: chain, query })
  const selectedCoin = useCurrentSendCoin()

  return (
    <VStack gap={12}>
      <SearchField
        variant="pill"
        autoFocus={false}
        value={query}
        onSearch={nextQuery =>
          setFilter(prev => ({ ...prev, query: nextQuery }))
        }
      />
      <SectionTitle>{t('chains')}</SectionTitle>
      <SendChainFilterButton />
      <SectionTitle>{t('assets')}</SectionTitle>
      <ListCard>
        {coins.length === 0 ? (
          <EmptyState size={14} color="shy" centerHorizontally>
            {t('no_tokens_found')}
          </EmptyState>
        ) : (
          coins.map(coin => (
            <CoinOption
              key={coinKeyToString(coin)}
              value={coin}
              showChain
              isActive={areEqualCoins(coin, selectedCoin)}
              onClick={() => {
                blurFocusedField()
                setCoin(coin)
                setStep(prev => ({ ...prev, field: 'address' }))
              }}
            />
          ))
        )}
      </ListCard>
    </VStack>
  )
}

const SectionTitle = styled(Text).attrs({ size: 12, color: 'shy' })`
  padding-top: 4px;
`

const ListCard = styled(VStack)`
  ${borderRadius.xl};
  overflow: hidden;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};

  > [role='button']:focus-visible {
    outline: none;
  }

  > [role='button']:not([aria-current='true']):hover,
  > [role='button']:not([aria-current='true']):focus-visible {
    background-color: ${getColor('foregroundDark')};
  }

  > [role='button'][aria-current='true']:focus-visible {
    outline: 1px solid ${getColor('primaryAccentFour')};
    outline-offset: -1px;
  }
`

const EmptyState = styled(Text)`
  padding: 24px 16px;
`
