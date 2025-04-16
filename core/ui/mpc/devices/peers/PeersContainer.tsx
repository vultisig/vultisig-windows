import { uniformColumnGrid } from '@lib/ui/css/uniformColumnGrid'
import styled from 'styled-components'

export const PeersContainer = styled.div`
  ${uniformColumnGrid({
    fullWidth: true,
    gap: 32,
    minChildrenWidth: 140,
  })}
`
