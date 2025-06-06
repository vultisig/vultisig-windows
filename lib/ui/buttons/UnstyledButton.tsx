import { interactive } from '@lib/ui/css/interactive'
import styled from 'styled-components'

export const UnstyledButton = styled.button.attrs(({ type = 'button' }) => ({
  type,
}))`
  ${interactive};
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  line-height: inherit;
`
