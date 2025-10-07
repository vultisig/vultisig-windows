import { desktopDownloadUrl, extensionDownloadUrl } from '@core/config'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { FacebookIcon } from '@lib/ui/icons/FacebookIcon'
import { LinkedinIcon } from '@lib/ui/icons/LinkedinIcon'
import { RedditIcon } from '@lib/ui/icons/RedditIcon'
import { TwitterIcon } from '@lib/ui/icons/TwitterIcon'
import { WhatsAppIcon } from '@lib/ui/icons/WhatsAppIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useTranslation } from 'react-i18next'

import { useCore } from '../../state/core'

type Props = {
  clientType: 'desktop' | 'extension'
} & OnCloseProp

export const ShareAppModal = ({ onClose, clientType }: Props) => {
  const { addToast } = useToast()
  const { openUrl } = useCore()
  const { t } = useTranslation()

  const shareURL =
    clientType === 'desktop' ? desktopDownloadUrl : extensionDownloadUrl

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareURL)
      .then(() => {
        addToast({ message: t('link_copied') })
      })
      .catch(() => {
        addToast({ message: t('failed_to_copy_link') })
      })
  }

  return (
    <Modal onClose={onClose} title="Vultisig">
      <VStack gap={24}>
        <VStack gap={14}>
          <Text color="light" size={13} weight={500}>
            {t('share_app')}
          </Text>
          <HStack gap={8} alignItems="center">
            <IconButton
              onClick={() =>
                openUrl(
                  `https://linkedin.com/sharing/share-offsite/?url=${shareURL}?utm_source=item-share-linkedin`
                )
              }
              size="lg"
            >
              <LinkedinIcon fontSize={24} />
            </IconButton>
            <IconButton
              onClick={() =>
                openUrl(
                  `https://facebook.com/sharer/sharer.php?u=${shareURL}?utm_source=item-share-facebook`
                )
              }
              size="lg"
            >
              <FacebookIcon fontSize={24} />
            </IconButton>
            <IconButton
              onClick={() =>
                openUrl(
                  `https://reddit.com/submit?url=${shareURL}?utm_source=item-share-reddit`
                )
              }
              size="lg"
            >
              <RedditIcon fontSize={24} />
            </IconButton>
            <IconButton
              onClick={() =>
                openUrl(
                  `https://wa.me/?text=${shareURL}?utm_source=item-share-whatsapp`
                )
              }
              size="lg"
            >
              <WhatsAppIcon fontSize={24} />
            </IconButton>
            <IconButton
              onClick={() =>
                openUrl(
                  `https://twitter.com/intent/tweet?url=${shareURL}?utm_source=item-share-x`
                )
              }
              size="lg"
            >
              <TwitterIcon fontSize={24} />
            </IconButton>
          </HStack>
        </VStack>
        <HStack gap={8} alignItems="center">
          <Text color="contrast" size={13} weight={500} cropped>
            {shareURL}
          </Text>
          <IconButton onClick={handleCopy}>
            <CopyIcon />
          </IconButton>
        </HStack>
      </VStack>
    </Modal>
  )
}
