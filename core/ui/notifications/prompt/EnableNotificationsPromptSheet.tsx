import { Button } from '@lib/ui/buttons/Button'
import { BellIcon } from '@lib/ui/icons/BellIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { PromptSheet, PromptSheetIcon } from '@lib/ui/sheet/PromptSheet'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const BellInPrompt = styled(BellIcon)`
  font-size: 24px;
  color: ${getColor('primaryAlt')};
`

type EnableNotificationsPromptSheetProps = {
  onClose: () => void
  onDismiss: () => void
  onEnable: () => void
}

export const EnableNotificationsPromptSheet = ({
  onClose,
  onDismiss,
  onEnable,
}: EnableNotificationsPromptSheetProps) => {
  const { t } = useTranslation()

  return (
    <PromptSheet
      actions={
        <HStack fullWidth gap={12}>
          <Button
            kind="secondary"
            onClick={() => {
              onDismiss()
              onClose()
            }}
          >
            {t('not_now')}
          </Button>
          <Button kind="primary" onClick={onEnable}>
            {t('enable')}
          </Button>
        </HStack>
      }
      description={
        <Text
          centerHorizontally
          color="shy"
          height={20 / 14}
          size={14}
          weight={500}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {t('secure_notifications_description')}
        </Text>
      }
      icon={
        <PromptSheetIcon>
          <BellInPrompt />
        </PromptSheetIcon>
      }
      title={
        <Text centerHorizontally color="regular" variant="title3">
          {t('secure_notifications_are_here')}
        </Text>
      }
      onClose={onClose}
    />
  )
}
