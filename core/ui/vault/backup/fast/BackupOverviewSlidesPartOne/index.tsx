import { useBackupOverviewStepsAnimations } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartOne/hooks/useBackupOverviewStepsAnimations'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const BackupOverviewSlidesPartOne: FC<OnFinishProp> = ({ onFinish }) => {
  const { t } = useTranslation()
  const {
    animations,
    handleNextAnimation,
    handlePrevAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useBackupOverviewStepsAnimations()
  const fontSize = 28

  return (
    <StyledLayout fullSize>
      <StyledHeader gap={16}>
        {currentAnimation > 1 && (
          <HStack justifyContent="space-between" fullWidth>
            <StyledButton
              icon={<ChevronLeftIcon fontSize={18} />}
              kind="link"
              onClick={handlePrevAnimation}
              size="sm"
            >
              {t('back')}
            </StyledButton>
          </HStack>
        )}
        <MultistepProgressIndicator
          markPreviousStepsAsCompleted
          steps={animations.length}
          value={animations.indexOf(currentAnimation) + 1}
          variant="bars"
        />
      </StyledHeader>
      <AnimationArea>
        <AnimationWrapper>
          <AnimationComponent />
        </AnimationWrapper>
      </AnimationArea>
      <StyledFooter>
        <AnimatedVisibility>
          {match(currentAnimation, {
            1: () => (
              <Text size={fontSize} centerHorizontally>
                {t('fastVaultSetup.backup.vaultShares')}{' '}
                <GradientText as="span">
                  {t('fastVaultSetup.backup.backThemUpNow')}
                </GradientText>
              </Text>
            ),
            2: () => (
              <Text size={fontSize} centerHorizontally>
                {t('fastVaultSetup.backup.part1')}{' '}
                <GradientText as="span">
                  {t('fastVaultSetup.backup.heldByServer')}.
                </GradientText>
              </Text>
            ),
            3: () => (
              <Text size={fontSize} centerHorizontally>
                {t('fastVaultSetup.backup.completeCustody')}{' '}
                <GradientText as="span">
                  {t('fastVaultSetup.backup.checkEmail')}
                </GradientText>
              </Text>
            ),
          })}
        </AnimatedVisibility>
        <IconButton
          disabled={isLoading}
          kind="primary"
          onClick={
            currentAnimation !== animations[animations.length - 1]
              ? handleNextAnimation
              : onFinish
          }
          size="xl"
        >
          <ChevronRightIcon />
        </IconButton>
      </StyledFooter>
    </StyledLayout>
  )
}

const StyledButton = styled(Button)`
  padding: 0;
  width: auto;
`

const StyledFooter = styled(VStack)`
  width: min(640px, 100%);
  gap: 32px;
  align-self: center;
  align-items: center;
  flex-shrink: 0;

  @media ${mediaQuery.mobileDeviceAndDown} {
    padding: 0 24px 20px;
  }
`

const StyledHeader = styled(VStack)`
  width: min(640px, 100%);
  align-self: center;
  align-items: center;

  @media ${mediaQuery.mobileDeviceAndDown} {
    padding: 20px 24px 0;
  }
`

const AnimationArea = styled(VStack)`
  flex: 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
  align-self: stretch;
  overflow: hidden;
`

const AnimationWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-width: 820px;
  margin: 0 auto;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;

  canvas,
  img,
  video {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }

  @media ${mediaQuery.mobileDeviceAndDown} {
    max-width: 100%;
    height: 320px;
  }
`

const StyledLayout = styled(PageContent)`
  margin: 0 auto;
  position: relative;
  width: min(1100px, 100%);
  height: 100%;
  min-height: 0;
  align-items: stretch;
  gap: 24px;
  overflow: hidden;
`
