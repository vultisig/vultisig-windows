import { Button } from '@lib/ui/buttons/Button'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ContentWrapper = styled(VStack)`
  width: 550px;
  align-self: center;
`

export const DescriptionTitleWrapper = styled(VStack)`
  align-self: center;
  align-items: center;
  padding-block: 8px;
`

export const DescriptionContentWrapper = styled(VStack)`
  border-top: 1px dotted ${getColor('textDark')};
  background-color: ${getColor('foreground')};
  padding: 16px;
  border-bottom-right-radius: 16px;
  border-bottom-left-radius: 16px;
  gap: 8px;
  width: 100%;
`

export const ConfirmButton = styled(Button)`
  width: 100%;
  align-self: center;
`

export const DescriptionWrapper = styled(VStack)`
  width: 550px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
`

export const IconWrapper = styled(VStack)`
  color: ${getColor('primary')};
`

export const ArtContainer = styled.div`
  ${vStack({
    flexGrow: true,
  })}
  width: 550px;
  flex-basis: 0;
  overflow: hidden;
`
