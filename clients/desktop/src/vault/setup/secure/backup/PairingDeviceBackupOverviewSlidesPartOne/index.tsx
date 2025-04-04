import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { PageContent } from '../../../../../ui/page/PageContent'
import { useCurrentVault } from '../../../../state/currentVault'
import { AnimationDescription } from './AnimationDescription'
import { useBackupOverviewStepsAnimations } from './hooks/useBackupOverviewStepsAnimations'
import { RiveWrapper } from './VaultOverviewSlides.styles'

type OnboardingStepsProps = {
  onCompleted: () => void
}

export const PairingDeviceBackupOverviewSlidesPartOne: FC<
  OnboardingStepsProps
> = ({ onCompleted }) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const deviceNumber = vault.signers.length
  const { keyshares } = vault
  const is5PlusDevice = deviceNumber >= 5
  const {
    animations,
    handleNextAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useBackupOverviewStepsAnimations(keyshares.length, deviceNumber)

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
              is5PlusDevice &&
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
