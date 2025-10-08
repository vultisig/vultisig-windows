import { desktopDownloadUrl, extensionDownloadUrl } from '@core/config'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../../state/core'

export const ShareAppPrompt = () => {
  const { addToast } = useToast()
  const { client } = useCore()
  const { t } = useTranslation()

  const shareURL =
    client === 'desktop' ? desktopDownloadUrl : extensionDownloadUrl

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareURL)
      .then(() => addToast({ message: t('link_copied') }))
      .catch(() => addToast({ message: t('failed_to_copy_link') }))
  }

  return (
    <Wrapper>
      <Text size={16} color="shy">
        {shareURL}
      </Text>
      <UnstyledButton onClick={handleCopy}>
        <IconWrapper size={20} color="buttonPrimary">
          <CopyIcon />
        </IconWrapper>
      </UnstyledButton>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 16px;

  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })};

  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
`
