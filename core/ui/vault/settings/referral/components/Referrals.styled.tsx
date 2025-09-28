import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

export const DecorationLine = styled.div`
  height: 1px;
  background: linear-gradient(90deg, #061b3a 0%, #284570 49.5%, #061b3a 100%);
`

export const FormField = styled.div`
  ${vStack({
    gap: 8,
  })}
`

export const FormFieldLabel = styled.label`
  ${text({
    size: 14,
    height: 'large',
    color: 'regular',
  })}
`

export const ReferralPageWrapper = styled(PageContent)`
  overflow-y: hidden;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    max-width: 650px;
    width: 100%;
    margin-inline: auto;
  }
`

export const FormFieldErrorText = styled.span`
  ${text({
    size: 10,
    color: 'danger',
  })}
`

export const fieldWrapperStyles = css`
  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 14px;
`

export const VerticalFieldWrapper = styled(VStack)`
  ${fieldWrapperStyles};
`

export const HorizontalFieldWrapper = styled(HStack)`
  ${fieldWrapperStyles};
  justify-content: space-between;
  align-items: center;
`

export const VaultFieldWrapper = styled(HorizontalFieldWrapper)`
  border-radius: 99px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
