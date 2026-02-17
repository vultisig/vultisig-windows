import { hStack } from '@lib/ui/layout/Stack'
import styled from 'styled-components'

import { ActionInputContainer } from './ActionInputContainer'

export const CollapsedFieldContainer = styled(ActionInputContainer)`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })}
`
