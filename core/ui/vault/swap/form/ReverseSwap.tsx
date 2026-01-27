import { useSwapToCoin } from '@core/ui/vault/swap/state/toCoin'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ArrowUpDownIcon } from '@lib/ui/icons/ArrowUpDownIcon'
import { SwapLoadingIcon } from '@lib/ui/icons/SwapLoadingIcon'
import { WarningIcon } from '@lib/ui/icons/WarningIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { useSwapQuoteQuery } from '../queries/useSwapQuoteQuery'
import { useSwapFromCoin } from '../state/fromCoin'
import { SwapErrorTooltip } from './SwapErrorTooltip'

type ReverseSwapProps = {
  errorMessage?: string | null
}

export const ReverseSwap = ({ errorMessage }: ReverseSwapProps) => {
  const [fromCoinKey, setFromCoinKey] = useSwapFromCoin()
  const [toCoin, setToCoin] = useSwapToCoin()
  const { isPending } = useSwapQuoteQuery()
  const prefersReducedMotion = useReducedMotion()
  const [isTooltipDismissed, setIsTooltipDismissed] = useState(false)

  const hasError = !!errorMessage

  // Reset tooltip dismissed state when error message changes
  useEffect(() => {
    setIsTooltipDismissed(false)
  }, [errorMessage])

  const showTooltip = hasError && !isTooltipDismissed

  const renderButton = (props: Record<string, unknown>) => (
    <Button
      {...props}
      $hasError={hasError}
      onClick={
        hasError
          ? undefined
          : () => {
              setFromCoinKey(toCoin)
              setToCoin(fromCoinKey)
            }
      }
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
      ) : hasError ? (
        <WarningIcon />
      ) : (
        <ArrowUpDownIcon />
      )}
    </Button>
  )

  return (
    <Wrapper justifyContent="center" alignItems="center">
      <SwapErrorTooltip
        content={showTooltip ? errorMessage : null}
        placement="top"
        onClose={() => setIsTooltipDismissed(true)}
        renderOpener={({ ref, ...rest }) => (
          <div ref={ref as React.Ref<HTMLDivElement>} {...rest}>
            {renderButton({})}
          </div>
        )}
      />
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

const Button = styled(UnstyledButton)<{ $hasError: boolean }>`
  ${sameDimensions(40)};
  background: ${({ $hasError }) =>
    $hasError ? getColor('danger') : getColor('buttonPrimary')};
  border-radius: ${({ $hasError }) => ($hasError ? '18px' : '1000px')};
  border: 2px solid ${getColor('background')};
  ${centerContent};
  font-size: ${({ $hasError }) => ($hasError ? '20px' : '16px')};
  color: ${getColor('contrast')};

  ${({ $hasError }) =>
    $hasError &&
    css`
      pointer-events: none;
      cursor: default;
    `}
`
