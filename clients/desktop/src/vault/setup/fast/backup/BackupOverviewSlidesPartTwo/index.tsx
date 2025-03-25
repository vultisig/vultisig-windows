import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { IconButton } from '../../../../../lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '../../../../../lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '../../../../../lib/ui/icons/ChevronRightIcon'
import { VStack } from '../../../../../lib/ui/layout/Stack'
import { Text } from '../../../../../lib/ui/text'
import { getColor } from '../../../../../lib/ui/theme/getters'
import { PageContent } from '../../../../../ui/page/PageContent'
import { AnimationDescription } from './AnimationDescription'
import { useBackupOverviewStepsAnimationsPartTwo } from './hooks/useBackupOverviewStepsAnimationsPartTwo'
import { RiveWrapper } from './VaultOverviewSlides.styles'

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
          <AnimationComponent />
        </RiveWrapper>
        <VStack gap={12}>
          <AnimationDescription />
          <NextAnimationButton
            disabled={isLoading}
            icon={<ChevronRightIcon />}
            onClick={onCompleted}
          >
            {t('tap')}
          </NextAnimationButton>
        </VStack>
      </VStack>
    </PageContent>
  )
}

const NextAnimationButton = styled(IconButton)`
  flex-shrink: 0;
  width: 84px;
  height: 48px;
  border-radius: 99px;
  background-color: ${getColor('primary')};
  align-self: center;

  &:hover {
    background-color: ${getColor('primary')};
  }

  & svg {
    stroke: ${getColor('textDark')};
  }
`

const ProgressWrapper = styled(VStack)`
  margin-inline: auto;
  margin-top: 48px;
`
