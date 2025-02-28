import { ComponentProps, FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { IconButton } from '../../../../../lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '../../../../../lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '../../../../../lib/ui/icons/ChevronRightIcon'
import { VStack } from '../../../../../lib/ui/layout/Stack'
import { Text } from '../../../../../lib/ui/text'
import { getColor } from '../../../../../lib/ui/theme/getters'
import { PageContent } from '../../../../../ui/page/PageContent'
import { useNewVault } from '../state/NewVaultProvider'
import { AnimationDescription } from './AnimationDescription'
import { useBackupOverviewStepsAnimations } from './hooks/useBackupOverviewStepsAnimations'
import { RiveWrapper } from './VaultOverviewSlides.styles'

export type SharedOnboardingScreensProps = {
  animationComponent: (props: ComponentProps<'canvas'>) => JSX.Element
  onNextAnimation: () => void
}

type OnboardingStepsProps = {
  onCompleted: () => void
}

export const BackupOverviewSlidesPartOne: FC<OnboardingStepsProps> = ({
  onCompleted,
}) => {
  const { t } = useTranslation()
  const [vault] = useNewVault()
  const { keyshares } = vault
  const {
    animations,
    handleNextAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useBackupOverviewStepsAnimations(keyshares.length)

  return (
    <PageContent>
      <ProgressWrapper gap={16}>
        <Text size={18}>
          {t(
            animations.indexOf(currentAnimation) === 0
              ? 'vaultOverview'
              : 'backupShare'
          )}
        </Text>
        <MultistepProgressIndicator
          markPreviousStepsAsCompleted
          steps={animations.length}
          stepWidth={`100px`}
          value={animations.indexOf(currentAnimation) + 1}
          variant="bars"
        />
      </ProgressWrapper>
      <VStack justifyContent="space-between" flexGrow>
        <RiveWrapper>
          <AnimationComponent />
        </RiveWrapper>
        <VStack gap={12}>
          <AnimationDescription animation={currentAnimation} />
          <NextAnimationButton
            disabled={isLoading}
            icon={<ChevronRightIcon />}
            onClick={
              currentAnimation !== animations[animations.length - 1]
                ? handleNextAnimation
                : onCompleted
            }
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
