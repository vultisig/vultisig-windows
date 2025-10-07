import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../../state/core'
import { useExternalLinks } from './hooks/useExternalLinks'
import { ShareAppPrompt } from './ShareAppPrompt'

export const ShareAppModalContent = () => {
  const { openUrl } = useCore()
  const { t } = useTranslation()
  const links = useExternalLinks()

  return (
    <VStack gap={24}>
      <Divider />
      <VStack gap={24}>
        <VStack gap={14}>
          <Text color="light" size={13} weight={500}>
            {t('share_app')}
          </Text>
          <HStack gap={14} alignItems="center">
            {links.map(({ icon: Icon, url }) => (
              <IconButton as="button" key={url} onClick={() => openUrl(url)}>
                <Icon />
              </IconButton>
            ))}
          </HStack>
        </VStack>
        <ShareAppPrompt />
      </VStack>
    </VStack>
  )
}

const IconButton = styled(UnstyledButton)`
  font-size: 38px;
  cursor: pointer;
`

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, #061b3a 0%, #284570 49.5%, #061b3a 100%);
`
