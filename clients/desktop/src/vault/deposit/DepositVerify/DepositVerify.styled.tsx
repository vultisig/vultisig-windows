import { text } from '@lib/ui/text'
import styled, { css } from 'styled-components'

const strictText = css`
  ${text({
    color: 'contrast',
    size: 14,
    weight: 400,
    family: 'mono',
  })}
`

export const StrictText = styled.p`
  ${strictText}
`

export const StrictTextContrast = styled(StrictText)`
  color: ${props => props.theme.colors.primary.toCssValue()};
`
