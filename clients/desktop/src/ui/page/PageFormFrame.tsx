import styled from 'styled-components'

import { vStack } from '../../lib/ui/layout/Stack'

export const PageFormFrame = styled.div`
  ${vStack({
    gap: 40,
    justifyContent: 'space-between',
    flexGrow: true,
  })}
`
