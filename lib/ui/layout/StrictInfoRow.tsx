import { hStack } from '@lib/ui/layout/Stack'
import { text } from '@lib/ui/text'
import styled from 'styled-components'

export const StrictInfoRow = styled.div`
  ${hStack({
    alignItems: 'center',
    justifyContent: 'space-between',
    fullWidth: true,
  })}

  ${text({
    color: 'shy',
    size: 12,
  })}
`
