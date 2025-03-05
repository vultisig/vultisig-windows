import styled from 'styled-components'

import { uniformColumnGrid } from '../../lib/ui/css/uniformColumnGrid'

export const PeersContainer = styled.div`
  ${uniformColumnGrid({
    fullWidth: true,
    gap: 40,
    minChildrenWidth: 140,
    maxChildrenWidth: 148,
  })}
`
