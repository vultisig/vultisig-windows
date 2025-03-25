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
          <Text size={32}>
            {t('backup')}{' '}
            <GradientText as="span">{t('this_vault_share')}</GradientText>{' '}
            {t('fastVaultSetup.backup.securely')}{' '}
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
  max-width: 500px;
  margin-inline: auto;
`

const TextWrapper = styled.div`
  margin-inline: auto;
  max-width: 1200px;
  text-align: center;
`
