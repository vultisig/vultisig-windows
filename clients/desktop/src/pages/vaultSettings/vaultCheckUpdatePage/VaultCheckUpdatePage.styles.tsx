import styled from 'styled-components'

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton'
import { Text } from '../../../lib/ui/text'

export const FixedWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 350px;
  height: 350px;
  margin: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

export const CenteredText = styled(Text)`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

export const DownloadButton = styled(UnstyledButton)`
  margin-left: 8px;
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.foreground.toCssValue()};
  color: ${({ theme }) => theme.colors.primary.toCssValue()};
  font-weight: 600;
`
