import { settingsBaselineOffset } from '@core/ui/settings/SettingsBaselineText'
import { SettingsStrongCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { ValueProp } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierBps,
  vultDiscountTierMinBalances,
} from '@vultisig/core-chain/swap/affiliate/config'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { CSSProperties, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCreateCoinMutation } from '../../../storage/coins'
import { formatDiscountPercentOfBaseFee } from '../../../vault/swap/affiliate/affiliateBps'
import { VultDiscountTierBadge } from './badge'
import { DiscountTierFooterBox } from './container'

const sheetInset = 16
// eslint-disable-next-line local/no-hardcoded-border-radius -- the frame's own sheet radius, off the scale
const sheetRadius = 20
const sheetBackdropStyles = { background: 'rgba(0, 0, 0, 0.7)' }
const sheetGrabberStyles = { background: 'transparent' }

const Title = styled.p`
  ${text({
    size: 28,
    weight: 500,
    centerHorizontally: true,
    color: 'shyExtra',
    height: 34 / 28,
    letterSpacing: -0.64,
  })}

  b {
    font-weight: inherit;
  }
`

const Description = styled.p`
  ${text({
    size: 14,
    weight: 400,
    centerHorizontally: true,
    color: 'shyExtra',
    height: 20 / 14,
  })}

  ${settingsBaselineOffset};

  b {
    color: ${getColor('text')};
    font-weight: 600;
  }
`

type UnlockDiscountTierProps = ValueProp<VultDiscountTier> & {
  style?: CSSProperties
}

/** A tier's Unlock footer and the sheet it opens, which leads to the $VULT swap. */
export const UnlockDiscountTier = ({
  value,
  style,
}: UnlockDiscountTierProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const { colors } = useTheme()
  const surface = colors.foreground.toCssValue()

  const { mutate: createCoin } = useCreateCoinMutation()

  return (
    <>
      <DiscountTierFooterBox
        value={value}
        style={{ cursor: 'pointer', ...style }}
        onClick={event => {
          event.stopPropagation()
          setIsOpen(true)
        }}
      >
        {t('unlock_tier')}
      </DiscountTierFooterBox>
      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        grabbable
        mobileFullWidth={false}
        backdropStyles={sheetBackdropStyles}
        drawerHeaderStyles={sheetGrabberStyles}
        drawerStyles={{
          background: `linear-gradient(transparent, ${surface} 45%), radial-gradient(${colors.primaryAlt.withAlpha(0.3).toCssValue()} 1px, transparent 1.5px) 0 0 / 12px 12px, ${surface}`,
          border: `1px solid ${colors.foregroundExtra.toCssValue()}`,
          borderRadius: sheetRadius,
          bottom: sheetInset,
        }}
      >
        <VStack alignItems="center" gap={20} padding="16px 15px 15px">
          <VStack alignItems="center" gap={26}>
            <VultDiscountTierBadge size={46} value={value} />
            <Title>
              <Trans
                i18nKey="unlock_discount_tier"
                values={{ tier: t(value) }}
                components={{ b: <b /> }}
              />
            </Title>
          </VStack>
          <Description>
            <Trans
              i18nKey={
                value === 'ultimate'
                  ? 'unlock_discount_tier_description_ultimate'
                  : 'unlock_discount_tier_description'
              }
              values={{
                tier: t(value),
                minBalance: formatAmount(vultDiscountTierMinBalances[value], {
                  ticker: `$${vult.ticker}`,
                }),
                percent: formatDiscountPercentOfBaseFee(
                  vultDiscountTierBps[value]
                ),
              }}
              components={{ b: <b /> }}
            />
          </Description>
          <SettingsStrongCtaButton
            onClick={() =>
              createCoin(vult, {
                onSuccess: coin => {
                  navigate({
                    id: 'swap',
                    state: { toCoin: extractCoinKey(coin) },
                  })
                },
              })
            }
          >
            {t('unlock_tier')}
          </SettingsStrongCtaButton>
        </VStack>
      </ResponsiveModal>
    </>
  )
}
