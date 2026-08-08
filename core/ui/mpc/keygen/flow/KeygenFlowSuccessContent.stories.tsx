import { GradientText } from '@lib/ui/text'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { KeygenFlowSuccessContent } from './KeygenFlowSuccessContent'

const meta: Meta<typeof KeygenFlowSuccessContent> = {
  title: 'Screens/Reshare/KeygenFlowSuccessContent',
  component: KeygenFlowSuccessContent,
  args: {
    securityType: 'secure',
  },
  decorators: [
    Story => (
      <div
        style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof KeygenFlowSuccessContent>

export const Reshare: Story = {
  args: {
    animationSource: 'vault-created',
    contained: true,
    title: (
      <>
        Vault reshared <GradientText>successfully</GradientText>
      </>
    ),
  },
}

export const Create: Story = {
  args: {
    title: (
      <>
        <GradientText>Well done</GradientText> You&apos;re ready to use a new
        wallet standard.
      </>
    ),
  },
}

export const StationFast: Story = {
  args: {
    animationSource: 'station-keygen-fast',
    securityType: 'fast',
    title: (
      <>
        <GradientText>Well done</GradientText> You&apos;re ready to use a new
        wallet standard.
      </>
    ),
  },
}
