import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CircleDollarSignIcon } from '@lib/ui/icons/CircleDollarSignIcon'
import { CoinsIcon } from '@lib/ui/icons/CoinsIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { IsActiveProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import {
  LimitSwapExpiryHours,
  limitSwapExpiryHours,
} from '@vultisig/core-chain/swap/native/limitSwapMemo'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { LimitPricePreset, limitPricePresets } from './price'

/** `72` reads as "3d" rather than "72h", matching the design. */
const expiryLabel: Record<LimitSwapExpiryHours, string> = {
  12: '12h',
  24: '24h',
  72: '3d',
}

export const limitPriceUnits = ['asset', 'fiat'] as const

export type LimitPriceUnit = (typeof limitPriceUnits)[number]

type LimitExecuteWhenProps = {
  toCoin: Coin
  /** Raw text in the price field, in the active unit. */
  priceInput: string
  onPriceInputChange: (value: string) => void
  unit: LimitPriceUnit
  onUnitChange: (unit: LimitPriceUnit) => void
  /** Rendered before the value (`$` in fiat mode). */
  valuePrefix: string | undefined
  /** Rendered after the value (the buy ticker in token mode). */
  valueSuffix: string | undefined
  /** Secondary line under the value: the other representation. */
  secondaryLabel: string | undefined
  /** Presets can only be applied once a market price exists to anchor them. */
  hasMarketPrice: boolean
  /** Current market price, already formatted in the active unit. */
  marketLabel: string | undefined
  onPresetSelect: (preset: LimitPricePreset) => void
  expiryHours: LimitSwapExpiryHours
  onExpiryChange: (hours: LimitSwapExpiryHours) => void
}

/**
 * The price step: what the order waits for.
 *
 * The price is entered against one unit of the *buy* asset ("1 BTC is worth …"),
 * which is how the design reads it. The authoritative value the memo encodes is
 * still the asset-to-asset rate — see `rate.ts` for why fiat entry converts once
 * rather than being stored.
 */
export const LimitExecuteWhen: FC<LimitExecuteWhenProps> = ({
  toCoin,
  priceInput,
  onPriceInputChange,
  unit,
  onUnitChange,
  valuePrefix,
  valueSuffix,
  secondaryLabel,
  hasMarketPrice,
  marketLabel,
  onPresetSelect,
  expiryHours,
  onExpiryChange,
}) => {
  const { t } = useTranslation()

  return (
    <Card gap={20}>
      <VStack gap={12}>
        <Text size={14} weight={500} color="contrast">
          {t('swap_limit_execute_when')}
        </Text>
        <Divider />
      </VStack>

      {marketLabel ? (
        <Text size={12} color="shy" centerHorizontally>
          {`${t('swap_limit_price_market')}  ${marketLabel}`}
        </Text>
      ) : null}

      <PriceRow>
        <VStack gap={6} alignItems="center">
          <HStack alignItems="center" gap={6}>
            <CoinIcon coin={toCoin} style={{ fontSize: 20 }} />
            <Text size={13} color="supporting">
              {t('swap_limit_one_unit', { ticker: toCoin.ticker })}
            </Text>
          </HStack>
          <ValueRow>
            {valuePrefix ? <Affix>{valuePrefix}</Affix> : null}
            <PriceInput
              value={priceInput}
              onChange={event => onPriceInputChange(event.currentTarget.value)}
              placeholder="0.0"
              inputMode="decimal"
              size={Math.max(priceInput.length || 3, 3)}
              data-testid="limit-price-input"
            />
            {valueSuffix ? <Affix>{valueSuffix}</Affix> : null}
          </ValueRow>
          {secondaryLabel ? (
            <Text size={13} color="shy">
              {secondaryLabel}
            </Text>
          ) : null}
        </VStack>
        <UnitToggleGroup>
          <UnitToggle
            type="button"
            isActive={unit === 'asset'}
            onClick={() => onUnitChange('asset')}
            data-testid="limit-unit-asset"
          >
            <CoinsIcon />
          </UnitToggle>
          <UnitToggle
            type="button"
            isActive={unit === 'fiat'}
            onClick={() => onUnitChange('fiat')}
            data-testid="limit-unit-fiat"
          >
            <CircleDollarSignIcon />
          </UnitToggle>
        </UnitToggleGroup>
      </PriceRow>

      <HStack gap={8} justifyContent="center">
        {limitPricePresets.map(preset => (
          <Pill
            key={preset}
            type="button"
            isActive={false}
            disabled={!hasMarketPrice}
            onClick={() => onPresetSelect(preset)}
          >
            <Text size={12} weight={500} as="span" color="supporting">
              {preset === 0 ? t('swap_limit_price_market') : `+${preset}%`}
            </Text>
          </Pill>
        ))}
      </HStack>

      <ExpiryCard alignItems="center" justifyContent="space-between" gap={12}>
        <Text size={14} weight={500} color="contrast">
          {t('swap_limit_expiry_label')}
        </Text>
        <HStack gap={8}>
          {limitSwapExpiryHours.map(hours => (
            <Pill
              key={hours}
              type="button"
              isActive={hours === expiryHours}
              onClick={() => onExpiryChange(hours)}
            >
              <Text
                size={12}
                weight={500}
                as="span"
                color={hours === expiryHours ? 'contrast' : 'supporting'}
              >
                {expiryLabel[hours]}
              </Text>
            </Pill>
          ))}
        </HStack>
      </ExpiryCard>
    </Card>
  )
}

const Card = styled(VStack)`
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  border-radius: 12px;
  padding: 16px;
`

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
`

// The price block stays optically centred while the unit toggle floats right,
// as in the design.
const PriceRow = styled.div`
  position: relative;
  padding: 8px 0 16px;
`

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
`

const Affix = styled.span`
  font-size: 36px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.contrast.toCssValue()};
`

const PriceInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  text-align: center;
  font-size: 36px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.contrast.toCssValue()};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textShy.toCssValue()};
  }
`

const UnitToggleGroup = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 3px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
`

const UnitToggle = styled(UnstyledButton)<IsActiveProp>`
  ${sameDimensions(32)};
  ${centerContent};
  border-radius: 18px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textShy.toCssValue()};

  ${({ isActive, theme }) =>
    isActive &&
    css`
      background: ${theme.colors.buttonPrimary.toCssValue()};
      color: ${theme.colors.contrast.toCssValue()};
    `};
`

const Pill = styled(UnstyledButton)<IsActiveProp>`
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  ${({ isActive, theme }) =>
    isActive &&
    css`
      border-color: ${theme.colors.buttonPrimary.toCssValue()};
    `};
`

const ExpiryCard = styled(HStack)`
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  border-radius: 12px;
  padding: 12px 16px;
`
