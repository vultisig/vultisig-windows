import styled from 'styled-components'

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 32px;
`

export const CenteredBox = styled.div`
  position: fixed;
  inset: 0;
  margin: auto;
  width: 350px;
  height: 350px;
  gap: 16px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
