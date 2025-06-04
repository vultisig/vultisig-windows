import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CoinsIcon } from '@lib/ui/icons/CoinsIcon'
import { DollarIcon } from '@lib/ui/icons/DollarIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { CurrencyInputMode } from './ManageAmountInputField'

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
      {Object.entries(currencyModeIcon).map(([mode, icon]) => (
        <IconButton
          key={mode}
          type={value === mode ? 'primary' : 'link'}
          onClick={() => onClick(mode as CurrencyInputMode)}
        >
          {icon}
        </IconButton>
      ))}
    </Wrapper>
  )
}

const Wrapper = styled(HStack)`
  padding: 8px 5px;
  font-size: 16px;
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};
  ${borderRadius.l}

  > button {
    border-radius: 50%;
  }
`
