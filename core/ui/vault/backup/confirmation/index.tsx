import { backupEducationUrl } from '@core/ui/vault/backup/education'
import { Button } from '@lib/ui/buttons/Button'
import { HardDriveDownloadIcon } from '@lib/ui/icons/HardDriveDownloadIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useIsTabletDeviceAndUp } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type BackupConfirmationProps = {
  onCompleted: () => void
  riveComponent: ReactNode
}

export const BackupConfirmation: FC<BackupConfirmationProps> = ({
  onCompleted,
  riveComponent,
}) => {
  const { t } = useTranslation()
  const isLargeScreen = useIsTabletDeviceAndUp()

  return (
    <VStack fullHeight>
      <PageHeader title={t('fastVaultSetup.backup.backupVault')} hasBorder />
      <PageContent alignItems="center" flexGrow scrollable>
        {riveComponent}
      </PageContent>
      <PageFooter alignItems="center" gap={32}>
        <VStack gap={16}>
          <Text
            variant={isLargeScreen ? 'h1Regular' : undefined}
            size={!isLargeScreen ? 24 : undefined}
            centerHorizontally
          >
            {t('fastVaultSetup.backup.backupConfirmationDescription')}
          </Text>
          <Text size={14} centerHorizontally color="shy">
            {t('fastVaultSetup.backup.onlineStorageDescription')}{' '}
            <Text
              as="a"
              color="supporting"
              href={backupEducationUrl}
              rel="noreferrer"
              target="_blank"
              style={{ textDecoration: 'underline' }}
              centerHorizontally
            >
              {t('learnMore')}
            </Text>
          </Text>
        </VStack>
        <Button
          icon={<HardDriveDownloadIcon />}
          onClick={onCompleted}
          style={{ width: 'auto' }}
        >
          {t('backup_now')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
