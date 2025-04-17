import { GradientText, Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AnimatedVisibility } from '../../../../../lib/ui/layout/AnimatedVisibility'
import { BACKUP_VAULT_ANIMATIONS } from './hooks/useBackupOverviewStepsAnimations'

type AnimationDescriptionProps = {
  animation: (typeof BACKUP_VAULT_ANIMATIONS)[number]
}
export const AnimationDescription: FC<AnimationDescriptionProps> = ({
  animation,
}) => {
  const { t } = useTranslation()
  const stepToAnimationDescription = [
    () => (
      <Text size={32}>
        {t('fastVaultSetup.backup.vaultShares')}{' '}
        <GradientText as="span">
          {t('fastVaultSetup.backup.backThemUpNow')}
        </GradientText>
      </Text>
    ),
    () => (
      <Text size={32}>
        {t('fastVaultSetup.backup.part1')}{' '}
        <GradientText as="span">
          {t('fastVaultSetup.backup.heldByServer')}.
        </GradientText>
      </Text>
    ),
    () => (
      <Text size={32}>
        {t('fastVaultSetup.backup.completeCustody')}{' '}
        <GradientText as="span">
          {t('fastVaultSetup.backup.checkEmail')}
        </GradientText>
      </Text>
    ),
  ]

  return (
    <div>
      <AnimatedVisibility>
        <TextWrapper>{stepToAnimationDescription[animation - 1]()}</TextWrapper>
      </AnimatedVisibility>
    </div>
  )
}

const TextWrapper = styled.div`
  margin-inline: auto;
  max-width: 1200px;
  text-align: center;
`
