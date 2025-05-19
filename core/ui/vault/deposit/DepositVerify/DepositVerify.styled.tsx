import { StrictText, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const StrictTextContrast = styled(StrictText)`
  color: ${getColor('primary')};
  ${text({
    family: 'mono',
  })}
`
