import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import {
  ChevronIconWrapper,
  ContentWrapperButton,
} from './VaultBackupBanner.styles'

const VaultBackupBanner = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <ContentWrapperButton
      onClick={() => navigate({ id: 'vaultBackup' })}
      data-testid="VaultBackupBanner-Content"
    >
      <TriangleAlertIcon fontSize={24} />
      <Text color="regular" size={14} weight="500">
        {t('vault_backup_banner_title')}
      </Text>
      <ChevronIconWrapper>
        <ChevronRightIcon fontSize={24} />
      </ChevronIconWrapper>
    </ContentWrapperButton>
  )
}

export default VaultBackupBanner
