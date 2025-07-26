import { useBackupOverviewStepsAnimationsPartTwo } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartTwo/hooks/useBackupOverviewStepsAnimationsPartTwo'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { useIsTabletDeviceAndUp } from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type OnboardingStepsProps = {
  onCompleted: () => void
}

export const BackupOverviewSlidesPartTwo: FC<OnboardingStepsProps> = ({
  onCompleted,
}) => {
  const { t } = useTranslation()
  const { animationComponent: AnimationComponent, isLoading } =
    useBackupOverviewStepsAnimationsPartTwo()
  const isLargeDevice = useIsTabletDeviceAndUp()
  const fontSize = isLargeDevice ? 32 : 24

  return (
    <VStack fullHeight>
      <VStack
        alignItems="center"
        gap={16}
        style={{ padding: pageConfig.verticalPadding }}
      >
        <Text size={18}>{t('vault_overview')}</Text>
        <MultistepProgressIndicator
          markPreviousStepsAsCompleted
          steps={3}
          value={3}
          variant="bars"
        />
      </VStack>
      <PageContent alignItems="center" flexGrow>
        <AnimationComponent />
      </PageContent>
      <PageFooter alignItems="center" gap={32}>
        <AnimatedVisibility>
          <Text size={fontSize} centerHorizontally>
            {t('backup')}{' '}
            <GradientText as="span">{t('this_vault_share')}</GradientText>{' '}
            {t('fastVaultSetup.backup.securely')}{' '}
            <GradientText as="span">
              {t('fastVaultSetup.backup.shareOnlineBackup')}
            </GradientText>
          </Text>
        </AnimatedVisibility>
        <IconButton
          disabled={isLoading}
          kind="primary"
          onClick={onCompleted}
          size="xl"
        >
          <ChevronRightIcon />
        </IconButton>
      </PageFooter>
    </VStack>
  )
}
