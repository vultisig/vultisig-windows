import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { FileUpIcon } from '@lib/ui/icons/FileUpIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ShareKeysignQrCode = ({
  value,
  onClick: saveImage,
}: ValueProp<string> & OnClickProp) => {
  const { t } = useTranslation()
  const { addToast } = useToast()

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(value)
      addToast({ message: t('link_copied') })
    } catch {
      addToast({ message: t('failed_to_copy_link'), status: 'error' })
    }
  }

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <IconButton onClick={onOpen} aria-label={t('share_qr_code')}>
          <FileUpIcon />
        </IconButton>
      )}
      renderContent={({ onClose }) => (
        <Dialog
          onClose={onClose}
          title={t('share_qr_code')}
          titleAlign="center"
          lockProps={{
            role: 'dialog',
            'aria-modal': true,
            'aria-label': t('share_qr_code'),
          }}
        >
          <HStack gap={8}>
            <Button kind="secondary" size="sm" onClick={copyLink}>
              {t('copy_link')}
            </Button>
            <Button size="sm" onClick={saveImage}>
              {t('share_qr_image')}
            </Button>
          </HStack>
        </Dialog>
      )}
    />
  )
}

const Dialog = styled(Modal)`
  width: min(360px, calc(100% - 32px));
  height: auto;
  max-height: calc(100% - 32px);
  ${borderRadius.md};
`
