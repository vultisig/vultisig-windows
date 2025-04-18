import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { interactive } from '@lib/ui/css/interactive'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const DropZoneContainer = styled.div`
  flex: 1;
  height: 400px;
  width: 100%;
  max-height: 400px;
  ${centerContent};
  ${borderRadius.m};
  padding: 20px;
  border: 1px dashed ${getColor('foregroundSuper')};
  background: ${getColor('foreground')};
`

export const InteractiveDropZoneContainer = styled(DropZoneContainer)`
  ${interactive};

  &:hover {
    background: ${({ theme }) =>
      theme.colors.foreground.getVariant({ a: () => 0.6 }).toCssValue()};
  }
`
