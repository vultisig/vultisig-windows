import { Opener } from '@lib/ui/base/Opener'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FileUpIcon } from '@lib/ui/icons/FileUpIcon'
import { ToastProvider } from '@lib/ui/toast/ToastProvider'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ShareKeysignQrCodeDialog } from './ShareKeysignQrCodeDialog'

const meta = {
  title: 'Keysign/ShareKeysignQrCodeDialog',
} satisfies Meta

export default meta
type Story = StoryObj

// Below the tablet breakpoint (the extension popup) this renders as a bottom
// sheet; at the expanded view's width it is a centered dialog.
export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Opener
        initialIsOpen
        renderOpener={({ onOpen }) => (
          <IconButton aria-label="Share QR Code" onClick={onOpen}>
            <FileUpIcon />
          </IconButton>
        )}
        renderContent={({ onClose }) => (
          <ShareKeysignQrCodeDialog
            joinUrl="https://vultisig.com?type=SignTransaction&vault=03abc&jsonData=GzA%2BAIyU"
            onSaveImage={() => {}}
            onClose={onClose}
          />
        )}
      />
    </ToastProvider>
  ),
}
