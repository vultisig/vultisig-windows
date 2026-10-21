import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack, vStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { attempt } from '@vultisig/lib-utils/attempt'
import FocusLock from 'react-focus-lock'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ShareKeysignQrCodeDialogProps = OnCloseProp & {
  joinUrl: string
  onSaveImage: () => void
}

/**
 * Offers the secure keysign join link either as text or as the saved QR image.
 * Copy Link writes `joinUrl` untouched, so pasting it on the co-signer is the
 * same as scanning the QR.
 */
export const ShareKeysignQrCodeDialog = ({
  joinUrl,
  onSaveImage,
  onClose,
}: ShareKeysignQrCodeDialogProps) => {
  const { t } = useTranslation()
  const { addToast } = useToast()

  const copyLink = async () => {
    const result = await attempt(() => navigator.clipboard.writeText(joinUrl))

    if ('error' in result) {
      addToast({ message: t('failed_to_copy_link'), status: 'error' })

      return
    }

    addToast({ message: t('link_copied') })
    onClose()
  }

  const saveImage = () => {
    onSaveImage()
    onClose()
  }

  return (
    <ResponsiveModal
      isOpen
      grabbable
      onClose={onClose}
      modalProps={{ withDefaultStructure: false }}
    >
      <Frame
        returnFocus
        lockProps={{
          role: 'dialog',
          'aria-modal': true,
          'aria-label': t('share_qr_code'),
        }}
      >
        <Text size={18} weight={500} color="contrast" centerHorizontally>
          {t('share_qr_code')}
        </Text>
        <HStack gap={12} fullWidth>
          <Button kind="secondary" onClick={copyLink}>
            {t('copy_link')}
          </Button>
          <Button onClick={saveImage}>{t('share_qr_image')}</Button>
        </HStack>
      </Frame>
    </ResponsiveModal>
  )
}

const Frame = styled(FocusLock)`
  ${vStack({ gap: 24 })};
  padding: 8px 16px 24px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: min(400px, calc(100vw - 32px));
    padding: 24px;
    background: ${getColor('background')};
    border: 1px solid ${getColor('mistExtra')};
    ${borderRadius.xl};
  }
`
