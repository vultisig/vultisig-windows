import { vStack } from '@lib/ui/layout/Stack'
import styled from 'styled-components'

export const ActionAmountInputSurface = styled.div`
  min-height: 100px;
  ${vStack({
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: true,
  })}

  * > input {
    text-align: center;
    font-size: 32px;
    background-color: transparent;
    border: none;

    &:focus,
    &:hover {
      outline: none;
    }

    &::placeholder {
      font-size: 24px;
    }
  }
`
