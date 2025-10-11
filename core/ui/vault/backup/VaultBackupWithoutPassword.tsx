import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { Button } from '@lib/ui/buttons/Button'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { FileWarningIcon } from '@lib/ui/icons/FileWarningIcon'
import { FolderLockIcon } from '@lib/ui/icons/FolderLockIcon'
import { LockKeyholeOpenIcon } from '@lib/ui/icons/LockKeyholeOpenIcon'
import { UserLockIcon } from '@lib/ui/icons/UserLockIcon'
import { InfoItem } from '@lib/ui/info/InfoItem'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import { Trans } from 'react-i18next'
import styled from 'styled-components'

const IconContainer = styled.div`
  ${sameDimensions(64)};
  ${centerContent};
  font-size: 32px;
  border-radius: 16px;
  align-self: center;
  background: ${getColor('foregroundExtra')};
`

type VaultBackupWithoutPasswordProps = OnFinishProp & {
  onPasswordRequest: () => void
}

const infoItems = [
  {
    icon: <LockKeyholeOpenIcon />,
    i18nKey: 'backup_password_info_secure_without_password',
  },
  {
    icon: <FolderLockIcon />,
    i18nKey: 'backup_password_info_encrypt_with_password',
  },
  {
    icon: <FileWarningIcon />,
    i18nKey: 'backup_password_info_cannot_be_reset',
  },
] as const

export const VaultBackupWithoutPassword = ({
  onFinish,
  onPasswordRequest,
  vaultIds,
}: VaultBackupWithoutPasswordProps & { vaultIds: string[] }) => {
  const { t } = useTranslation()
  const { mutate: backupVault, isPending } = useBackupVaultMutation({
    onSuccess: onFinish,
    vaultIds,
  })

  return (
    <VStack fullHeight>
      <FlowPageHeader title={t('backup')} />
      <FitPageContent contentMaxWidth={360}>
        <VStack gap={68} justifyContent="center">
          <VStack gap={36}>
            <IconContainer>
              <UserLockIcon />
            </IconContainer>
            <VStack alignItems="center" gap={16}>
              <Text size={22} centerHorizontally>
                {t('backup_password_confirmation_title')}
              </Text>
              {infoItems.map(({ i18nKey, icon }) => (
                <InfoItem key={i18nKey} icon={icon}>
                  <Trans i18nKey={i18nKey} components={{ b: <b /> }} />
                </InfoItem>
              ))}
            </VStack>
          </VStack>
          <VStack gap={12}>
            <Button loading={isPending} onClick={() => backupVault({})}>
              {t('backup_without_password')}
            </Button>
            <Button
              disabled={isPending}
              kind="secondary"
              onClick={onPasswordRequest}
            >
              {t('backup_with_password')}
            </Button>
          </VStack>
        </VStack>
      </FitPageContent>
    </VStack>
  )
}
