import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { UnreadableVaultKeySharesError } from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import {
  settingsBaselineOffset,
  SettingsBaselineText,
} from '@core/ui/settings/SettingsBaselineText'
import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { FileWarningIcon } from '@lib/ui/icons/FileWarningIcon'
import { FolderLockIcon } from '@lib/ui/icons/FolderLockIcon'
import { FoldersIcon } from '@lib/ui/icons/FoldersIcon'
import { LockFilledIcon } from '@lib/ui/icons/LockFilledIcon'
import { LockPasswordIcon } from '@lib/ui/icons/LockPasswordIcon'
import { TriangleWarningFilledIcon } from '@lib/ui/icons/TriangleWarningFilledIcon'
import { UserLockIcon } from '@lib/ui/icons/UserLockIcon'
import { InfoItem } from '@lib/ui/info/InfoItem'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import { Trans } from 'react-i18next'
import styled from 'styled-components'

const IconContainer = styled.div`
  ${sameDimensions(64)};
  ${centerContent};
  font-size: 32px;
  ${borderRadius.lg};
  align-self: center;
  background: ${getColor('foregroundExtra')};
`

// The frame's body starts 22 under the header and ends 20 above the window edge.
const SettingsContent = styled(FitPageContent)`
  padding-bottom: 20px;
  padding-top: 22px;
`

// A 1px border inside the frame's 16 padding; browsers draw this text 1px high.
const SettingsInfoItem = styled(InfoItem)`
  ${borderRadius.lg};
  padding: 15px;

  p {
    letter-spacing: 0.06px;
    line-height: 18px;
    ${settingsBaselineOffset};
  }
`

type VaultBackupWithoutPasswordProps = OnFinishProp & {
  onPasswordRequest: () => void
  isSettingsLook: boolean
}

const infoItems = [
  {
    icon: <LockFilledIcon />,
    settingsIcon: <LockFilledIcon />,
    i18nKey: 'backup_password_info_secure_without_password',
  },
  {
    icon: <FolderLockIcon />,
    settingsIcon: <FoldersIcon />,
    i18nKey: 'backup_password_info_encrypt_with_password',
  },
  {
    icon: <FileWarningIcon />,
    settingsIcon: <TriangleWarningFilledIcon />,
    i18nKey: 'backup_password_info_cannot_be_reset',
  },
] as const

/** Asks whether to encrypt the backup, and saves it unencrypted when declined. */
export const VaultBackupWithoutPassword = ({
  onFinish,
  onPasswordRequest,
  vaultIds,
  onBack,
  isSettingsLook,
}: VaultBackupWithoutPasswordProps &
  Partial<OnBackProp> & { vaultIds: string[] }) => {
  const { t } = useTranslation()
  const {
    mutate: backupVault,
    isPending,
    error,
  } = useBackupVaultMutation({
    onSuccess: onFinish,
    vaultIds,
  })

  const Content = isSettingsLook ? SettingsContent : FitPageContent
  const Item = isSettingsLook ? SettingsInfoItem : InfoItem
  const ActionButton = isSettingsLook ? SettingsCtaButton : Button

  return (
    <VStack fullHeight>
      {isSettingsLook ? (
        <SettingsPageHeader title={null} onBack={onBack} />
      ) : (
        <FlowPageHeader title={t('backup')} onBack={onBack} />
      )}
      <Content contentMaxWidth={360}>
        <VStack gap={isSettingsLook ? 24 : 68} justifyContent="center">
          <VStack gap={isSettingsLook ? 24 : 36}>
            <IconContainer>
              {isSettingsLook ? <LockPasswordIcon /> : <UserLockIcon />}
            </IconContainer>
            <VStack alignItems="center" gap={16}>
              {isSettingsLook ? (
                <SettingsBaselineText
                  centerHorizontally
                  color="regular"
                  variant="title2"
                >
                  {t('backup_password_confirmation_title')}
                </SettingsBaselineText>
              ) : (
                <Text size={22} centerHorizontally>
                  {t('backup_password_confirmation_title')}
                </Text>
              )}
              {infoItems.map(({ i18nKey, icon, settingsIcon }) => (
                <Item key={i18nKey} icon={isSettingsLook ? settingsIcon : icon}>
                  <Trans i18nKey={i18nKey} components={{ b: <b /> }} />
                </Item>
              ))}
            </VStack>
          </VStack>
          <VStack gap={12}>
            <ActionButton
              disabled={isPending}
              loading={isPending}
              onClick={() => backupVault({})}
            >
              {t('backup_without_password')}
            </ActionButton>
            <ActionButton
              disabled={isPending}
              kind="secondary"
              onClick={onPasswordRequest}
            >
              {t('backup_with_password')}
            </ActionButton>
            {error && (
              <Text color="danger" size={12}>
                {error instanceof UnreadableVaultKeySharesError
                  ? t('vault_cannot_be_opened_description')
                  : t('failed_to_save_vault')}
              </Text>
            )}
          </VStack>
        </VStack>
      </Content>
    </VStack>
  )
}
