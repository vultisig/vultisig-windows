import type { Meta, StoryObj } from '@storybook/react-vite'

import { ReshareThresholdNotMetCard } from './ReshareThresholdNotMetCard'

const meta: Meta<typeof ReshareThresholdNotMetCard> = {
  title: 'Screens/Reshare/ReshareThresholdNotMetCard',
  component: ReshareThresholdNotMetCard,
  decorators: [
    Story => (
      <div style={{ maxWidth: 360, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof ReshareThresholdNotMetCard>

// Dragging down to a single device grows the "Plugin Store compatible" footer.
export const SingleDevice: Story = {
  args: {
    fromDeviceCount: 5,
    toDeviceCount: 1,
    requiredSigners: 3,
  },
}

// Above one device the card is just the threshold warning, no footer.
export const MultipleDevices: Story = {
  args: {
    fromDeviceCount: 5,
    toDeviceCount: 2,
    requiredSigners: 3,
  },
}
