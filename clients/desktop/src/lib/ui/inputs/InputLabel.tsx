import { Text } from '@lib/ui/text'
import styled from 'styled-components'

export const InputLabel = styled(Text).attrs(
  ({ size = 14, color = 'contrast', as = 'div' }) => ({
    size,
    color,
    as,
  })
)``
