import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime'
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton'
import { text } from '../../../lib/ui/text'

const Container = styled(UnstyledButton)`
  align-self: flex-end;
  ${text({
    weight: 600,
    color: 'primary',
  })}
  text-decoration: underline;
`

export const SwapTrackingLink = ({ value }: ValueProp<string>) => {
  const { t } = useTranslation()

  return (
    <Container
      onClick={() => {
        BrowserOpenURL(value)
      }}
    >
      {t('swap_tracking_link')}
    </Container>
  )
}
