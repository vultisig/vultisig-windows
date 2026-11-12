import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { CircleDashedIcon } from '@lib/ui/icons/CircleDashedIcon'
import { DollarIcon } from '@lib/ui/icons/DollarIcon'
import { getColor } from '@lib/ui/theme/getters'
import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  CurrencyInputMode,
  currencyInputModes,
  currencySwapSpring,
  currencySwitchWidthPx,
} from './currencyInputMode'

type Props = {
  value: CurrencyInputMode
  onClick: (value: CurrencyInputMode) => void
}

const currencyModeIcon: Record<CurrencyInputMode, ReactNode> = {
  base: <CircleDashedIcon />,
  fiat: <DollarIcon />,
}

const currencyModeLabelKey = {
  base: 'asset',
  fiat: 'currency',
} as const satisfies Record<CurrencyInputMode, string>

const optionGapPx = 2
const pillPaddingPx = 3
const optionSizePx = currencySwitchWidthPx - 2 * pillPaddingPx

const highlightReducedTransition = { duration: 0 }

/**
 * The asset/fiat toggle beside the amount: the two icons stay put and a
 * highlight slides to the chosen one. Pressing it keeps focus where it was,
 * so a focused amount field can hand focus to the other one.
 */
export const CurrencySwitch = ({ onClick, value }: Props) => {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion() === true

  return (
    <Pill>
      <Highlight
        aria-hidden
        initial={false}
        animate={{
          y: currencyInputModes.indexOf(value) * (optionSizePx + optionGapPx),
        }}
        transition={
          shouldReduceMotion ? highlightReducedTransition : currencySwapSpring
        }
      />
      {currencyInputModes.map(mode => (
        <Option
          key={mode}
          aria-label={t(currencyModeLabelKey[mode])}
          aria-pressed={value === mode}
          onMouseDown={event => event.preventDefault()}
          onClick={() => onClick(mode)}
        >
          {currencyModeIcon[mode]}
        </Option>
      ))}
    </Pill>
  )
}

const Pill = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${optionGapPx}px;
  padding: ${pillPaddingPx}px;
  font-size: 16px;
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};
  ${borderRadius.pill};
`

const Highlight = styled(motion.div)`
  position: absolute;
  top: ${pillPaddingPx}px;
  left: ${pillPaddingPx}px;
  width: ${optionSizePx}px;
  height: ${optionSizePx}px;
  background: ${getColor('buttonPrimary')};
  ${borderRadius.pill};
`

const Option = styled(UnstyledButton)`
  position: relative;
  width: ${optionSizePx}px;
  height: ${optionSizePx}px;
  ${centerContent};
  ${borderRadius.pill};

  &:focus-visible {
    outline: 1px solid ${getColor('primaryAccentFour')};
    outline-offset: 1px;
  }
`
