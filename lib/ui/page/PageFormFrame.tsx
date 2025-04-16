import { vStack } from '@lib/ui/layout/Stack'
import styled from 'styled-components'

export const PageFormFrame = styled.div`
  ${vStack({
    gap: 40,
    justifyContent: 'space-between',
    flexGrow: true,
  })}
`
