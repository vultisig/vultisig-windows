import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const FaqButton = styled(UnstyledButton)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 16px;
  ${borderRadius.m};
  background-color: ${getColor('foreground')};

  & > * {
    text-align: start;
  }
`

export const HorizontalLine = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${getColor('textShy')};
`

export const Row = styled(HStack)`
  align-self: stretch;
`

export const FaqContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
`
