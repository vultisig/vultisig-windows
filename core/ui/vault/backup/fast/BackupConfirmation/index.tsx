import { Button } from '@lib/ui/buttons/Button'
import DownloadIcon from '@lib/ui/icons/DownloadIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useIsTabletDeviceAndUp } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { useRive } from '@rive-app/react-canvas'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { backupEducationUrl } from '../../education'

const Wrapper = styled(VStack)`
  max-width: 800px;
  align-self: center;
`

const Content = styled(VStack)`
  flex: 1;
`

const RivePlaceholder = styled(VStack)`
  position: relative;
  flex: 1;
  width: 100%;
`

type BackupConfirmationProps = {
  onCompleted: () => void
}

export const BackupConfirmation: FC<BackupConfirmationProps> = ({
  onCompleted,
}) => {
  const { t } = useTranslation()
  const { RiveComponent } = useRive({
    src: '/core/animations/fast-vault-backup-splash.riv',
    autoplay: true,
  })

  const isLargeScreen = useIsTabletDeviceAndUp()

  return (
    <PageContent>
      <PageHeader
        title={
          <Text size={16} weight={500}>
            {t('fastVaultSetup.backup.backupVault')}
          </Text>
        }
      />
      <Wrapper
        flexGrow
        alignItems="center"
        justifyContent="space-between"
        gap={48}
      >
        <Content alignItems="center" justifyContent="space-between" gap={40}>
          <RivePlaceholder alignItems="center" justifyContent="center">
            <RiveComponent
              style={{
                flexGrow: 1,
              }}
            />
          </RivePlaceholder>
          <VStack gap={16}>
            <Text
              centerHorizontally
              variant={isLargeScreen ? 'h1Regular' : undefined}
              size={!isLargeScreen ? 24 : undefined}
            >
              {t('fastVaultSetup.backup.backupConfirmationDescription')}
            </Text>
            <Text centerHorizontally color="shy" size={14}>
              {t('fastVaultSetup.backup.onlineStorageDescription')}{' '}
              <StyledAnchor
                href={backupEducationUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Text centerHorizontally color="supporting" as="span">
                  {t('learnMore')}
                </Text>
              </StyledAnchor>
            </Text>
          </VStack>
        </Content>
        <VStack gap={4}>
          <BackupButton onClick={onCompleted} size="m">
            <DownloadIcon />
            <Text as="span" size={14}>
              {t('backup_now')}
            </Text>
          </BackupButton>
        </VStack>
      </Wrapper>
    </PageContent>
  )
}

const BackupButton = styled(Button)`
  font-size: 20px;
  gap: 8px;
`

const StyledAnchor = styled.a`
  text-decoration: underline;
`
