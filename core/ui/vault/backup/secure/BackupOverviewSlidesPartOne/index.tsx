import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AnimationDescription } from './AnimationDescription'
import { useBackupOverviewStepsAnimations } from './hooks/useBackupOverviewStepsAnimations'
import { RiveWrapper } from './VaultOverviewSlides.styles'

type OnboardingStepsProps = {
  onCompleted: () => void
}

export const BackupOverviewSlidesPartOne: FC<OnboardingStepsProps> = ({
  onCompleted,
}) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const { signers } = vault
  const {
    animations,
    handleNextAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useBackupOverviewStepsAnimations(signers.length)

  return (
    <Wrapper>
      <ProgressWrapper gap={16} alignItems="center">
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
          <AnimationComponent
            style={{
              flexGrow: 1,
            }}
          />
        </RiveWrapper>
        <DescriptionWrapper>
          <AnimationDescription animation={currentAnimation} />
        </DescriptionWrapper>
        <BottomItemsWrapper>
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
        </BottomItemsWrapper>
      </VStack>
    </Wrapper>
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
  padding: 16px;
`

const Wrapper = styled(PageContent)`
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`

const DescriptionWrapper = styled.div`
  flex-shrink: 0;
  max-width: 600px;
  margin-inline: auto;
`

const BottomItemsWrapper = styled.div`
  flex-shrink: 0;
  padding: 8px 0;
  display: flex;
  justify-content: center;
`