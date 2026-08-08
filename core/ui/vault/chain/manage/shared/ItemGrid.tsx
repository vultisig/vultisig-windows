import styled, { css } from 'styled-components'

export const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(74px, 1fr));
  column-gap: 16px;
  row-gap: 16px;

  ${({ theme }) =>
    theme.iconStyle === 'station' &&
    css`
      grid-template-columns: repeat(auto-fill, 74px);
    `}
`
