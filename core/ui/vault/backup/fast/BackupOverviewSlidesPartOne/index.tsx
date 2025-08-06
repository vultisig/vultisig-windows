import { useBackupOverviewStepsAnimations } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartOne/hooks/useBackupOverviewStepsAnimations'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
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
    <StyledLayout maxWidth={400} fullSize>
      <StyledHeader gap={16}>
        <HStack justifyContent="space-between">
          <StyledButton
            icon={
              currentAnimation > 1 ? (
                <ChevronLeftIcon fontSize={18} />
              ) : undefined
            }
            kind="link"
            onClick={currentAnimation > 1 ? handlePrevAnimation : undefined}
            size="sm"
          >
            {t('back')}
          </StyledButton>
        </HStack>
        <MultistepProgressIndicator
          markPreviousStepsAsCompleted
          steps={animations.length}
          value={animations.indexOf(currentAnimation) + 1}
          variant="bars"
        />
      </StyledHeader>
      <StyledContent alignItems="center">
        <AnimationComponent />
      </StyledContent>
      <StyledFooter alignItems="center" gap={32}>
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

const StyledContent = styled(VStack)`
  height: 400px;
  padding: 0;
`

const StyledFooter = styled(VStack)`
  bottom: 0px;
  padding: 0 24px 36px;
  position: absolute;
`

const StyledHeader = styled(VStack)`
  padding: 36px 24px 0;
`

const StyledLayout = styled(VStack)`
  margin: 0 auto;
  position: relative;
`
