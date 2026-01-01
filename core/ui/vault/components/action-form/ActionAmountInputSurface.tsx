import { vStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ActionAmountInputSurface = styled.div`
  height: 170px;
  ${vStack({
    justifyContent: 'center',
    alignItems: 'center',
  })}

  * > input {
    text-align: center;
    font-size: 32px;
    background-color: transparent;
    border: none;

    &:focus-visible {
      outline: 2px solid ${getColor('primary')};
      outline-offset: 6px;
    }

    &:hover {
      outline: 2px solid ${getColor('mist')};
      outline-offset: 6px;
    }

    &::placeholder {
      font-size: 24px;
    }
  }
`
