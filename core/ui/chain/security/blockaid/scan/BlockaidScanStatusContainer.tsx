import { text } from '@lib/ui/text'
import styled from 'styled-components'

export const BlockaidScanStatusContainer = styled.p`
  ${text({
    centerVertically: {
      gap: 2,
    },
    size: 13,
    color: 'regular',
  })}
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
  min-height: 16px;
`
