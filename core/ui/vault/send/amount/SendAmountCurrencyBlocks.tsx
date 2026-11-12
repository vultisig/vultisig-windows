import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { Match } from '@lib/ui/base/Match'
import { VStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { motion, useReducedMotion } from 'framer-motion'
import { Ref } from 'react'
import styled from 'styled-components'

import { useCurrentSendCoin } from '../state/sendCoin'
import { AmountInReverseCurrencyDisplay } from './AmountInReverseCurrencyDisplay'
import { BaseSendAmountInput } from './BaseSendAmountInput'
import {
  CurrencyInputMode,
  currencyInputModes,
  currencySwapSpring,
} from './currencyInputMode'
import { FiatSendAmountInput } from './FiatSendAmountInput'

type SendAmountCurrencyBlocksProps = InputProps<bigint | null> & {
  ref: Ref<HTMLDivElement>
  mode: CurrencyInputMode
  inputProps: {
    isWarning: boolean
    placeholder: string
    disabled: boolean
  }
}

const amountBlockMinHeightPx = 100
const currencySwapHiddenScale = 0.85
const currencySwapReducedTransition = {
  duration: 0.2,
  ease: 'easeInOut',
} as const

/**
 * The asset and fiat amount fields, both mounted in one grid cell so a swap
 * never moves the card. The hidden one shrinks and fades out and is inert;
 * with reduced motion they crossfade.
 */
export const SendAmountCurrencyBlocks = ({
  ref,
  mode: shownMode,
  inputProps,
  value,
  onChange,
}: SendAmountCurrencyBlocksProps) => {
  const coin = useCurrentSendCoin()
  const { data: price } = useCoinPriceQuery({ coin })
  const fiatCurrency = useFiatCurrency()
  const shouldReduceMotion = useReducedMotion() === true

  const transition = shouldReduceMotion
    ? currencySwapReducedTransition
    : currencySwapSpring
  const hiddenScale = shouldReduceMotion ? 1 : currencySwapHiddenScale

  return (
    <Blocks ref={ref}>
      {currencyInputModes.map(mode => {
        const isShown = mode === shownMode
        if (mode === 'fiat' && !price) return null

        return (
          <Block
            key={mode}
            data-currency-block={mode}
            initial={false}
            animate={{
              opacity: isShown ? 1 : 0,
              scale: isShown ? 1 : hiddenScale,
            }}
            transition={transition}
            {...(!isShown && { inert: true, 'aria-hidden': true })}
          >
            <Match
              value={mode}
              base={() => (
                <VStack alignItems="center" gap={8}>
                  <BaseSendAmountInput
                    {...inputProps}
                    value={value}
                    onChange={onChange}
                    decimals={coin.decimals}
                    ticker={coin.ticker}
                  />
                  <AmountInReverseCurrencyDisplay value="base" />
                </VStack>
              )}
              fiat={() => (
                <VStack alignItems="center" gap={4}>
                  <AmountInReverseCurrencyDisplay value="fiat" />
                  <FiatSendAmountInput
                    {...inputProps}
                    value={value}
                    onChange={onChange}
                    decimals={coin.decimals}
                    price={shouldBePresent(price)}
                    currency={fiatCurrency.toUpperCase()}
                  />
                </VStack>
              )}
            />
          </Block>
        )
      })}
    </Blocks>
  )
}

const Blocks = styled.div`
  flex: 1;
  min-width: 0;
  min-height: ${amountBlockMinHeightPx}px;
  display: grid;
  align-items: center;
`

const Block = styled(motion.div)`
  grid-area: 1 / 1;
  min-width: 0;
`
