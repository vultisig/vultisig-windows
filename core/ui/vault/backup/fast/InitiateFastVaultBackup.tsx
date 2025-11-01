import { getVaultId } from '@core/mpc/vault/Vault'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { usePassword } from '../../../state/password'
import { useCurrentVault } from '../../state/currentVault'

export const InitiateFastVaultBackup = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const [password] = usePassword()
  const vault = useCurrentVault()

  const { mutate: backupVault, isPending } = useBackupVaultMutation({
    onSuccess: onFinish,
    vaultIds: [getVaultId(vault)],
  })

  return (
    <VStack fullHeight>
      <FlowPageHeader title={t('backup')} />
      <FitPageContent contentMaxWidth={360}>
        <VStack gap={54}>
          <img src="/core/images/backup-clouds.png" alt="Backup Clouds" />
          <VStack gap={36}>
            <VStack gap={16}>
              <Text size={28} weight={500} color="contrast" centerHorizontally>
                {t('fast_vault_backup_title')}
              </Text>
              <Text size={14} weight={500} color="shy" centerHorizontally>
                {t('fast_vault_backup_description')}
              </Text>
            </VStack>

            <Button
              loading={isPending}
              onClick={() => backupVault({ password })}
            >
              {t('back_up_now')}
            </Button>
          </VStack>
        </VStack>
      </FitPageContent>
    </VStack>
  )
}
