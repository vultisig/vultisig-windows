import styled from 'styled-components'

import { vStack } from '../../lib/ui/layout/Stack'

export const PeersPageContentFrame = styled.div`
  ${vStack({
    fullWidth: true,
    gap: 40,
    alignItems: 'center',
    justifyContent: 'center',
  })}
`
