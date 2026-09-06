import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { useOptionalNavigationHistory } from '@lib/ui/navigation/state'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ImportVaultBackupButton } from './ImportVaultBackupButton'

/**
 * Dead end for a vault whose key shares cannot be read. Offers the backup
 * import where the host has a navigation stack to reach it; a host without
 * one (the extension's dApp popup) can only be closed, and the vault is
 * recovered from the main app instead.
 */
export const UnreadableVaultRecovery = () => {
  const { t } = useTranslation()
  const { goBack } = useCore()
  const canImportBackup = useOptionalNavigationHistory() !== undefined
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
            {canImportBackup ? (
              <ImportVaultBackupButton />
            ) : (
              <Button onClick={goBack}>{t('close')}</Button>
            )}
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
