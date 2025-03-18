import styled from 'styled-components'

import { Text } from '../text'

export const InputLabel = styled(Text).attrs(
  ({ size = 14, color = 'contrast', as = 'div' }) => ({
    size,
    color,
    as,
  })
)``
