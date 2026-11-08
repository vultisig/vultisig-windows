import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { useKeyDown } from '@lib/ui/hooks/useKeyDown'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OptionsProp } from '@lib/ui/props'
import { SearchField } from '@lib/ui/search/SearchField'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { useState } from 'react'
import FocusLock from 'react-focus-lock'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FixedWrapper, ReferralFormContent } from '../../../Referrals.styled'
import { PayoutAssetOption } from './PayoutAssetOption'

type PayoutAssetPickerProps = OptionsProp<AccountCoin> & {
  chain: Chain
  onFinish: (coin?: AccountCoin) => void
}

/** Page that picks the payout asset among the coins with an active pool on the current chain. */
export const PayoutAssetPicker = ({
  options,
  chain,
  onFinish,
}: PayoutAssetPickerProps) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  useKeyDown('Escape', () => onFinish())

  const filtered = options.filter(({ ticker }) =>
    ticker.toLowerCase().startsWith(query.toLowerCase())
  )

  return (
    <BodyPortal>
      <FocusLock returnFocus>
        <FixedWrapper>
          <VStack fullHeight fullWidth>
            <SettingsPageHeader
              onBack={() => onFinish()}
              title={t('choose_payout_asset')}
            />
            <ReferralFormContent flexGrow gap={24} scrollable>
              {options.length > 1 || query ? (
                <SearchField
                  onSearch={setQuery}
                  showPlaceholderWhenFocused
                  style={{ flexShrink: 0, height: 42 }}
                  value={query}
                  variant="pill"
                />
              ) : null}
              <VStack gap={16}>
                <HStack alignItems="center" gap={6}>
                  <Text color="shy" variant="caption">
                    {t('chain')}
                  </Text>
                  <ChainEntityIcon
                    style={{ fontSize: 16 }}
                    value={getChainLogoSrc(chain)}
                  />
                  <Text variant="caption">{chain}</Text>
                </HStack>
                <Options>
                  {filtered.map(coin => (
                    <PayoutAssetOption
                      key={coin.id ?? coin.ticker}
                      onClick={() => onFinish(coin)}
                      value={coin}
                    />
                  ))}
                </Options>
              </VStack>
            </ReferralFormContent>
          </VStack>
        </FixedWrapper>
      </FocusLock>
    </BodyPortal>
  )
}

const Options = styled(VStack)`
  ${borderRadius.xl};
  overflow: hidden;
`
