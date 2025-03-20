import styled from 'styled-components'

import { text } from '../text'
import { hStack } from './Stack'

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
