import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CopiesFilledIcon } from '@lib/ui/icons/CopiesFilledIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { hStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { desktopDownloadUrl, extensionDownloadUrl } from '@vultisig/core-config'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../../state/core'
import { SettingsBaselineText } from '../SettingsBaselineText'
import { settingsFieldSurface } from '../settingsField'

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
      .catch(() =>
        addToast({ message: t('failed_to_copy_link'), status: 'error' })
      )
  }

  return (
    <Wrapper>
      <SettingsBaselineText cropped color="shyExtra" variant="stationBodyS">
        {shareURL}
      </SettingsBaselineText>
      <CopyButton onClick={handleCopy}>
        <IconWrapper size={20} color="text">
          <CopiesFilledIcon />
        </IconWrapper>
      </CopyButton>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  --icon-accent: ${getColor('textShyExtra')};
  gap: 8px;
  padding: 15px;

  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })};

  ${settingsFieldSurface};
`

const CopyButton = styled(UnstyledButton)`
  flex-shrink: 0;
  line-height: 0;
`
