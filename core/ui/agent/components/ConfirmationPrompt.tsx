import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { formatToolName } from '../utils/formatToolName'

type Props = {
  action: string
  details: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmationPrompt: FC<Props> = ({
  action,
  details,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      title={t('confirm_action')}
      onClose={onCancel}
      footer={
        <VStack gap={8} fullWidth>
          <Button onClick={onConfirm}>{t('confirm')}</Button>
          <Button kind="outlined" onClick={onCancel}>
            {t('cancel')}
          </Button>
        </VStack>
      }
    >
      <VStack gap={16}>
        <Text size={14} color="supporting">
          {t('confirm_action_description', { action: formatToolName(action) })}
        </Text>
        <DetailsBox>
          <Text size={12} color="supporting" style={{ whiteSpace: 'pre-wrap' }}>
            {details}
          </Text>
        </DetailsBox>
      </VStack>
    </Modal>
  )
}

const DetailsBox = styled.div`
  padding: 12px;
  background: ${getColor('foreground')};
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
`
