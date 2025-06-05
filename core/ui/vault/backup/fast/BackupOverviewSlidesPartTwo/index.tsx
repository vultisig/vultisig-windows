import { AnimationDescription } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartTwo/AnimationDescription'
import { useBackupOverviewStepsAnimationsPartTwo } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartTwo/hooks/useBackupOverviewStepsAnimationsPartTwo'
import { RiveWrapper } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartTwo/VaultOverviewSlides.styles'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type OnboardingStepsProps = {
  onCompleted: () => void
}

export const BackupOverviewSlidesPartTwo: FC<OnboardingStepsProps> = ({
  onCompleted,
}) => {
  const { t } = useTranslation()
  const { animationComponent: AnimationComponent, isLoading } =
    useBackupOverviewStepsAnimationsPartTwo()

  return (
    <PageContent>
      <ProgressWrapper gap={16}>
        <Text size={18}>{t('vault_overview')}</Text>
        <MultistepProgressIndicator
          markPreviousStepsAsCompleted
          steps={3}
          stepWidth={`100px`}
          value={3}
          variant="bars"
        />
      </ProgressWrapper>
      <VStack justifyContent="space-between" flexGrow>
        <RiveWrapper>
          <AnimationComponent
            style={{
              flexGrow: 1,
            }}
          />
        </RiveWrapper>
        <VStack gap={12}>
          <AnimationDescription />
          <IconButton disabled={isLoading} onClick={onCompleted} size="xl">
            <ChevronRightIcon />
          </IconButton>
        </VStack>
      </VStack>
    </PageContent>
  )
}

const ProgressWrapper = styled(VStack)`
  margin-inline: auto;
  margin-top: 48px;
`
