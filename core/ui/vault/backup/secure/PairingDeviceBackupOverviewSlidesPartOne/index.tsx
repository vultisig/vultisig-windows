import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
  const { signers } = vault
  const is5PlusDevice = deviceNumber >= 5
  const {
    animations,
    handleNextAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useBackupOverviewStepsAnimations(signers.length, deviceNumber)

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
          <IconButton
            disabled={isLoading}
            onClick={
              is5PlusDevice &&
              currentAnimation !== animations[animations.length - 1]
                ? handleNextAnimation
                : onCompleted
            }
            size="xl"
          >
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
