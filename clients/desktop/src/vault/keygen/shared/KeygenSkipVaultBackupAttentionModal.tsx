import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Button } from '../../../lib/ui/buttons/Button'
import { Checkbox } from '../../../lib/ui/inputs/checkbox/Checkbox'
import { VStack } from '../../../lib/ui/layout/Stack'
import { Modal } from '../../../lib/ui/modal'

const StyledModal = styled(Modal)`
  border: none;
`

const OrangeButton = styled(Button)<{
  isActive: boolean
}>`
  background-color: ${({ theme, isActive }) =>
    !isActive
      ? theme.colors.idle.withAlpha(0.8).toCssValue()
      : theme.colors.idle.toCssValue()};

  &:hover {
    background-color: ${({ theme, isActive }) =>
      !isActive
        ? theme.colors.idle.withAlpha(0.8).toCssValue()
        : theme.colors.idle.toCssValue()};
  }
`

const KeygenSkipVaultBackupAttentionModal = ({
  onClose,
  onSkip,
}: {
  onClose: () => void
  onSkip: () => void
}) => {
  const [hasAcceptedRisk, setHasAcceptedRisk] = useState(false)
  const { t } = useTranslation()

  return (
    <StyledModal
      title={t('vault_backup_keygen_skip_modal_title')}
      onClose={onClose}
    >
      <VStack gap={20}>
        <Checkbox
          onChange={() => setHasAcceptedRisk(!hasAcceptedRisk)}
          value={hasAcceptedRisk}
          label={t('vault_backup_keygen_skip_modal_checkbox_label')}
        />
        <OrangeButton
          isActive={hasAcceptedRisk}
          disabled={!hasAcceptedRisk}
          onClick={onSkip}
        >
          {t('vault_backup_keygen_skip_modal_title')}
        </OrangeButton>
        <Button as="div" kind="outlined" onClick={onClose}>
          {t('back')}
        </Button>
      </VStack>
    </StyledModal>
  )
}

export default KeygenSkipVaultBackupAttentionModal
