import { CurrencyInputMode } from '@core/ui/vault/send/amount/ManageAmountInputField'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CoinsIcon } from '@lib/ui/icons/CoinsIcon'
import { DollarIcon } from '@lib/ui/icons/DollarIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { LayoutGroup, motion } from 'framer-motion'
import { ReactNode } from 'react'
import styled from 'styled-components'

type Props = {
  value: CurrencyInputMode
  onClick: (value: CurrencyInputMode) => void
}

const currencyModeIcon: Record<CurrencyInputMode, ReactNode> = {
  base: <CoinsIcon />,
  fiat: <DollarIcon />,
}

export const CurrencySwitch = ({ onClick, value }: Props) => {
  return (
    <Wrapper gap={2}>
      <LayoutGroup>
        {(Object.keys(currencyModeIcon) as CurrencyInputMode[])
          .sort((a, b) => (a === value ? -1 : b === value ? 1 : 0))
          .map(mode => {
            const isActive = value === mode
            return (
              <AnimatedIconButton
                $isActive={isActive}
                key={mode}
                kind={isActive ? 'primary' : 'link'}
                onClick={() => onClick(mode)}
                layout
              >
                {currencyModeIcon[mode]}
              </AnimatedIconButton>
            )
          })}
      </LayoutGroup>
    </Wrapper>
  )
}

const AnimatedIconButton = motion(styled(IconButton)<{ $isActive: boolean }>`
  border-radius: 50%;
  scale: ${({ $isActive }) => ($isActive ? 1.1 : 1)};
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.6)};
  transition:
    scale 0.2s ease,
    opacity 0.2s ease;
`)

const Wrapper = styled(VStack)`
  padding: 8px 5px;
  font-size: 16px;
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};
  ${borderRadius.l};

  > button {
    border-radius: 50%;
  }
`
