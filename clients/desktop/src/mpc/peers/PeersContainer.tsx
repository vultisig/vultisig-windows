import styled from 'styled-components'

import { uniformColumnGrid } from '../../lib/ui/css/uniformColumnGrid'

export const PeersContainer = styled.div`
  ${uniformColumnGrid({
    gap: 48,
    minChildrenWidth: 150,
    maxChildrenWidth: 200,
  })}
`
