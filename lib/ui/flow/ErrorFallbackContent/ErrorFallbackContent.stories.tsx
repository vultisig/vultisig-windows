import type { Meta, StoryObj } from '@storybook/react-vite'

import { ErrorFallbackContent } from '.'

const meta: Meta<typeof ErrorFallbackContent> = {
  title: 'Flow/ErrorFallbackContent',
  component: ErrorFallbackContent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    variant: { control: 'inline-radio', options: ['error', 'warning'] },
  },
  args: {
    variant: 'error',
    title: 'Transaction failed',
    description:
      "One of your devices didn't respond in time. Check your connection and try again.",
    error:
      'javax.crypto.AEADBadTagException: error:1e000065:Cipher functions:OPENSSL_internal:BAD_DECRYPT\n  at java.lang.reflect.Constructor.newInstance0(Native Method)\n  at com.android.org.conscrypt.OpenSSLAeadCipher.engineDoFinal(OpenSSLAeadCipher.java:283)',
    onReportBug: () => alert('Open Discord'),
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const HardFailure: Story = {}

export const RecoverableWarning: Story = {
  args: {
    variant: 'warning',
    title: 'Network unstable',
    description:
      'Vault creation slowed due to poor connectivity. You can retry or wait for reconnection.',
    error: undefined,
  },
}

export const TitleOnly: Story = {
  args: { description: undefined, error: undefined },
  parameters: { controls: { hideNoControlsWarning: true } },
}
