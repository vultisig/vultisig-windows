import { Button } from '@lib/ui/buttons/Button'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ContentWrapper = styled(VStack)`
  @media ${mediaQuery.tabletDeviceAndUp} {
    width: 550px;
  }

  width: 100%;
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
  align-self: stretch;
  flex-basis: 0;
  overflow: hidden;
`
