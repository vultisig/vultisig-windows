import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 32px;
`

export const CenteredBox = styled.div`
  position: fixed;
  inset: 0;
  margin: auto;
  width: 350px;
  height: 350px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export const ResponsiveText = styled(Text)`
  font-size: 18px;

  @media (${mediaQuery.desktopDeviceAndUp}) {
    font-size: 22px;
  }
`

export const StyledTriangleWarningIcon = styled(TriangleAlertIcon)`
  color: ${getColor('alertWarning')};
`
