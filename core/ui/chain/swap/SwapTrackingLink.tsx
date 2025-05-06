import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ValueProp } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../../state/core'

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
  const { openUrl } = useCore()

  return (
    <Container
      onClick={() => {
        openUrl(value)
      }}
    >
      {t('swap_tracking_link')}
    </Container>
  )
}
