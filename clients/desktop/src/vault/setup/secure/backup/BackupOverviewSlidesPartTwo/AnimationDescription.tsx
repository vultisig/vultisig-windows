import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AnimatedVisibility } from '../../../../../lib/ui/layout/AnimatedVisibility'
import { GradientText, Text } from '../../../../../lib/ui/text'

export const AnimationDescription = () => {
  const { t } = useTranslation()

  return (
    <Wrapper>
      <AnimatedVisibility>
        <TextWrapper>
          <Text size={48}>
            {t('fastVaultSetup.backup.backUp')}{' '}
            <GradientText as="span">
              {t('fastVaultSetup.backup.thisVault')}
            </GradientText>{' '}
            {t('fastVaultSetup.backup.shareSecurely')}{' '}
            <GradientText as="span">
              {t('fastVaultSetup.backup.shareOnlineBackup')}
            </GradientText>
          </Text>
        </TextWrapper>
      </AnimatedVisibility>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  min-height: 144px;
  max-width: 500px;
  align-self: center;
`

export const TextWrapper = styled.div`
  margin-inline: auto;
  max-width: 1200px;
  text-align: center;
`
