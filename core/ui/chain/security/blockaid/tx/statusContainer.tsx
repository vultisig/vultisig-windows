import { text } from '@lib/ui/text'
import styled from 'styled-components'

export const BlockaidTxStatusContainer = styled.p`
  ${text({
    centerVertically: {
      gap: 2,
    },
    size: 13,
    color: 'supporting',
  })}
  min-height: 16px;
`
