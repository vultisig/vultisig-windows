import { useSwapToCoin } from '@core/ui/vault/swap/state/toCoin'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ArrowUpDownIcon } from '@lib/ui/icons/ArrowUpDownIcon'
import { SwapLoadingIcon } from '@lib/ui/icons/SwapLoadingIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { motion, useReducedMotion } from 'framer-motion'
import styled from 'styled-components'

import { useSwapQuoteQuery } from '../queries/useSwapQuoteQuery'
import { useSwapFromCoin } from '../state/fromCoin'

export const ReverseSwap = () => {
  const [fromCoinKey, setFromCoinKey] = useSwapFromCoin()
  const [toCoin, setToCoin] = useSwapToCoin()
  const { isPending } = useSwapQuoteQuery()
  const prefersReducedMotion = useReducedMotion()

  return (
    <Wrapper justifyContent="center" alignItems="center">
      <Button
        onClick={() => {
          setFromCoinKey(toCoin)
          setToCoin(fromCoinKey)
        }}
      >
        {isPending ? (
          <motion.span
            key="spinner"
            role="img"
            aria-label="loading"
            style={{
              display: 'inline-flex',
              willChange: 'transform',
              fontSize: 12,
            }}
            initial={{ rotate: 0 }}
            animate={prefersReducedMotion ? { rotate: 0 } : { rotate: 360 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { repeat: Infinity, ease: 'linear', duration: 0.8 }
            }
          >
            <SwapLoadingIcon />
          </motion.span>
        ) : (
          <ArrowUpDownIcon />
        )}
      </Button>
    </Wrapper>
  )
}

const Wrapper = styled(HStack)`
  background-color: ${getColor('background')};
  border-radius: 25.5px;
  padding: 7px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &::before {
    content: '';
    position: absolute;
    width: 54px;
    top: 0;
    height: 19px;
    border-radius: 50px;
    border: 1px solid ${getColor('foregroundExtra')};
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-bottom: none;
  }

  &::after {
    content: '';
    position: absolute;
    width: 54px;
    bottom: 0px;
    height: 19px;
    border-radius: 50px;
    border: 1px solid ${getColor('foregroundExtra')};
    border-top-right-radius: 0;
    border-top-left-radius: 0;
    border-top: none;
  }
`

const Button = styled(UnstyledButton)`
  ${round};
  ${sameDimensions(40)};
  background: ${getColor('buttonPrimary')};
  border: 2px solid ${getColor('background')};
  ${centerContent};
  font-size: 16px;
  color: ${getColor('contrast')};
`
