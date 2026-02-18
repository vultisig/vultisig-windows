import styled from 'styled-components'

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  & > :last-child {
    word-break: break-all;
    text-align: right;
    min-width: 0;
  }
`
