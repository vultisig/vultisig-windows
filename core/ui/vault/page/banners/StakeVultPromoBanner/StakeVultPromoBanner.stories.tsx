import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReactNode } from 'react'

import { StakeVultPromoBannerContent } from './StakeVultPromoBannerContent'

const Frame = ({ width, children }: { width: number; children: ReactNode }) => (
  <div style={{ width, padding: 20 }}>{children}</div>
)

const meta: Meta<typeof StakeVultPromoBannerContent> = {
  title: 'Banners/StakeVultPromoBanner',
  component: StakeVultPromoBannerContent,
  parameters: { layout: 'centered' },
  args: {
    onStake: () => {},
    onDismiss: () => {},
  },
}

export default meta

type Story = StoryObj<typeof StakeVultPromoBannerContent>

export const Mobile: Story = {
  render: args => (
    <Frame width={360}>
      <StakeVultPromoBannerContent {...args} />
    </Frame>
  ),
}

export const Tablet: Story = {
  render: args => (
    <Frame width={600}>
      <StakeVultPromoBannerContent {...args} />
    </Frame>
  ),
}
