import { getVaultId } from '@core/mpc/vault/Vault'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { BackupWarningMessage } from '@core/ui/vault/backup/BackupWarningMessage'
import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCurrentVault } from '../../state/currentVault'

type InitiateFastVaultBackupProps = OnFinishProp &
  OnBackProp & {
    password: string
  }

export const InitiateFastVaultBackup = ({
  onFinish,
  onBack,
  password,
}: InitiateFastVaultBackupProps) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const { mutate: backupVault, isPending } = useBackupVaultMutation({
    onSuccess: onFinish,
    vaultIds: [getVaultId(vault)],
  })

  return (
    <VStack fullHeight>
      <FlowPageHeader title={t('backup')} onBack={onBack} />
      <Content>
        <Hero>
          <HeroImage src="/core/images/backup-clouds.png" alt="Backup Clouds" />
        </Hero>
        <Copy gap={36}>
          <VStack gap={16} alignItems="center">
            <Text size={32} weight={500} color="contrast" centerHorizontally>
              {t('fast_vault_backup_title')}
            </Text>
            <Text size={16} weight={500} color="shy" centerHorizontally>
              {t('fast_vault_backup_description')}
            </Text>
            <BackupWarningMessage />
          </VStack>
          <Button loading={isPending} onClick={() => backupVault({ password })}>
            {t('back_up_now')}
          </Button>
        </Copy>
      </Content>
    </VStack>
  )
}

const Content = styled(PageContent)`
  flex-grow: 1;
  gap: 48px;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const Hero = styled(VStack)`
  flex: 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const HeroImage = styled.img`
  width: min(640px, 100%);
  height: auto;
`

const Copy = styled(VStack)`
  width: min(520px, 100%);
  align-items: center;
`
