import { useSwapToCoin } from '@core/ui/vault/swap/state/toCoin'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ArrowsRotateCenterIcon } from '@lib/ui/icons/ArrowsRotateCenterIcon'
import { WarningIcon } from '@lib/ui/icons/WarningIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { CircularProgressIndicator } from '@lib/ui/loaders/CircularProgressIndicator'
import { getColor } from '@lib/ui/theme/getters'
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
      data-testid="swap-reverse"
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
        <CircularProgressIndicator style={{ fontSize: 20 }} />
      ) : hasError ? (
        <WarningIcon />
      ) : (
        <ArrowsRotateCenterIcon />
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
  ${borderRadius.pill};
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
    ${borderRadius.pill};
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
    ${borderRadius.pill};
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
  ${({ $hasError }) => ($hasError ? borderRadius.lg : borderRadius.pill)};
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
