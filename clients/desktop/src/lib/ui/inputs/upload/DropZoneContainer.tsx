import styled from 'styled-components'

import { borderRadius } from '../../css/borderRadius'
import { centerContent } from '../../css/centerContent'
import { interactive } from '../../css/interactive'
import { getColor } from '../../theme/getters'

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
