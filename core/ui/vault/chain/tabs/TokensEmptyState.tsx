import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const TokensEmptyState = () => {
  const { t } = useTranslation()

  return (
    <Wrapper alignItems="center" gap={12} style={{ padding: '64px 40px' }}>
      <IconWrapper size={24} color="buttonHover">
        <CryptoIcon />
      </IconWrapper>
      <VStack gap={8} alignItems="center">
        <Text size={17} weight="500" color="contrast" centerHorizontally>
          {t('no_tokens_selected')}
        </Text>
        <Text
          size={13}
          color="shy"
          centerHorizontally
          style={{ maxWidth: 280, textAlign: 'center' }}
        >
          {t('no_tokens_selected_description')}
        </Text>
      </VStack>
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  border-radius: 12px;
  background: ${getColor('foreground')};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, #061b3a 0%, #284570 49.5%, #061b3a 100%);
  }
`
