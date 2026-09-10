import styled from 'styled-components'

/**
 * Grid for the 74px chain, token and DeFi tiles. Tracks are sized to the
 * tile and the leftover width is shared between them, so the row lines up
 * with the content edges and the 360px popup fits four columns.
 */
export const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 74px);
  justify-content: space-between;
  column-gap: 8px;
  row-gap: 16px;
`
