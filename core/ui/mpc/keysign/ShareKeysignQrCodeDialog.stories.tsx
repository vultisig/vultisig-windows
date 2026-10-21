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
      <ShareKeysignQrCodeDialog
        joinUrl="https://vultisig.com?type=SignTransaction&vault=03abc&jsonData=GzA%2BAIyU"
        onSaveImage={() => {}}
        onClose={() => {}}
      />
    </ToastProvider>
  ),
}
