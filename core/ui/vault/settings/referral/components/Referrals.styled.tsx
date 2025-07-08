import { vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { text } from '@lib/ui/text'
import styled from 'styled-components'

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
