import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const UnreadableVaultRecovery = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [isNoBackupExpanded, setIsNoBackupExpanded] = useState(false)

  return (
    <VStack fullSize>
      <PageHeader />
      <FlowErrorPageContent
        title={t('vault_cannot_be_opened')}
        description={`${t('vault_cannot_be_opened_description')} ${t(
          'vault_cannot_be_opened_backup_description'
        )}`}
        action={
          <VStack gap={8} fullWidth>
            <Button onClick={() => navigate({ id: 'importVault' })}>
              {t('import_vult_backup')}
            </Button>
            <Button
              kind="link"
              aria-expanded={isNoBackupExpanded}
              onClick={() => setIsNoBackupExpanded(value => !value)}
            >
              {t('vault_cannot_be_opened_no_backup')}
            </Button>
            {isNoBackupExpanded ? (
              <Text color="shyExtra" size={12} centerHorizontally>
                {t('vault_cannot_be_opened_no_backup_description')}
              </Text>
            ) : null}
          </VStack>
        }
      />
    </VStack>
  )
}
