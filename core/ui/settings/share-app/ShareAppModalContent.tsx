import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../../state/core'
import { SettingsBaselineText } from '../SettingsBaselineText'
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
          <SettingsBaselineText color="shy" variant="footnote">
            {t('share_app')}
          </SettingsBaselineText>
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
  line-height: 0;
`

// Figma draws this line above its zero-height layer, so it takes no room in the column.
const Divider = styled.div`
  height: 1px;
  margin-top: -1px;
  background: ${getColor('foregroundExtra')};
`
