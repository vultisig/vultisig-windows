import { IconButton } from '@lib/ui/buttons/IconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { InfoCircleIcon } from '@lib/ui/icons/InfoCircleIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled(HStack)`
  background: ${getColor('foreground')};
  border-radius: 16px;
  padding: 16px;
`

/**
 * Dismissible pointer on the placement done screen telling the user where a
 * resting order lives from now on — Transaction History's Limit Orders tab.
 * Dismissal is per-mount on purpose: the hint is cheap, and remembering it
 * forever would hide the answer exactly when a first-time user needs it again.
 */
export const LimitOrdersDoneHint = () => {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return null
  }

  return (
    <Container gap={12} alignItems="center">
      <Text color="supporting" centerVertically>
        <InfoCircleIcon />
      </Text>
      <VStack gap={2} style={{ flex: 1 }}>
        <Text size={14} weight={500} color="contrast">
          {t('swap_limit_orders_title')}
        </Text>
        <Text size={13} color="supporting">
          {t('swap_limit_done_hint')}
        </Text>
      </VStack>
      <IconButton onClick={() => setDismissed(true)}>
        <CrossIcon />
      </IconButton>
    </Container>
  )
}
