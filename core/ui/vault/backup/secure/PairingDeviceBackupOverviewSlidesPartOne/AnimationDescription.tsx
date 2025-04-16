import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { GradientText, Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BACKUP_VAULT_ANIMATIONS } from './hooks/useBackupOverviewStepsAnimations'

type AnimationDescriptionProps = {
  animation: (typeof BACKUP_VAULT_ANIMATIONS)[number]
}
export const AnimationDescription: FC<AnimationDescriptionProps> = ({
  animation,
}) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const stepToAnimationDescription = [
    () => (
      <Text size={32}>
        {t('secureVaultSetup.backup.shares', {
          shares: vault.signers.length,
        })}{' '}
        <GradientText as="span">
          {t('secureVaultSetup.backup.eachDeviceNeedsBackup')}
        </GradientText>
      </Text>
    ),
    () => (
      <Text size={32}>
        {t('backup')}{' '}
        <GradientText as="span">{t('this_vault_share')}</GradientText>{' '}
        {t('fastVaultSetup.backup.shareSecurely')}{' '}
        <GradientText as="span">
          {t('fastVaultSetup.backup.shareOnlineBackup')}
        </GradientText>
      </Text>
    ),
  ]

  return (
    <Wrapper>
      <AnimatedVisibility>
        <TextWrapper>{stepToAnimationDescription[animation - 1]()}</TextWrapper>
      </AnimatedVisibility>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  max-width: 500px;
  align-self: center;
`

const TextWrapper = styled.div`
  margin-inline: auto;
  max-width: 1200px;
  text-align: center;
`
