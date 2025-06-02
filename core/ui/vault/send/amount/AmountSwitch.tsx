import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CoinsIcon } from '@lib/ui/icons/CoinsIcon'
import { DollarIcon } from '@lib/ui/icons/DollarIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { CurrencyInputMode } from './ManageAmountInputField'

type Props = {
  value: CurrencyInputMode
  onClick: (value: CurrencyInputMode) => void
}

const config = [
  { mode: 'base', icon: <CoinsIcon /> },
  { mode: 'fiat', icon: <DollarIcon /> },
] as const

export const CurrencySwitch = ({ onClick, value }: Props) => {
  return (
    <Wrapper gap={2}>
      {config.map(({ mode, icon }) => (
        <IconButton
          key={mode}
          icon={icon}
          kind={value === mode ? 'primary' : 'regular'}
          onClick={() => onClick(mode)}
        />
      ))}
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  padding: 8px 5px;
  margin-top: 24px;
  font-size: 16px;
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};
  ${borderRadius.l}

  > button {
    border-radius: 50%;
  }
`
