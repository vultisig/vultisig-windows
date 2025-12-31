import { centerContent } from '@lib/ui/css/centerContent'
import { DownloadSeedphraseIcon } from '@lib/ui/icons/DownloadSeedphraseIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${getColor('foreground')};
  ${centerContent};
  font-size: 20px;
  color: ${getColor('info')};
`

export const EnterSeedphraseHeader = () => {
  const { t } = useTranslation()

  return (
    <VStack gap={24} alignItems="center">
      <IconContainer>
        <DownloadSeedphraseIcon />
      </IconContainer>
      <VStack gap={8} alignItems="center">
        <Text size={22} weight={500} color="contrast">
          {t('enter_your_seedphrase')}
        </Text>
        <Text
          size={14}
          weight={500}
          color="shy"
          centerHorizontally
          style={{ maxWidth: 329 }}
        >
          <Trans
            i18nKey="enter_seedphrase_subtitle"
            components={{ h: <Text color="contrast" as="span" /> }}
          />
        </Text>
      </VStack>
    </VStack>
  )
}
