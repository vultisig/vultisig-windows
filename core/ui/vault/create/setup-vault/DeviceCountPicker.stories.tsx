import type { Meta, StoryObj } from '@storybook/react-vite'

import { DeviceCountPicker } from './DeviceCountPicker'

const meta: Meta<typeof DeviceCountPicker> = {
  title: 'Screens/Reshare/DeviceCountPicker',
  component: DeviceCountPicker,
  args: {
    onBack: () => {},
    onSubmit: () => {},
  },
  decorators: [
    Story => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof DeviceCountPicker>

export const NewVault: Story = {}

export const Reshare: Story = {
  args: {
    initialIndex: 1,
    minSelectableIndex: 1,
    submitText: 'Next',
  },
}

// Larger vault: dragging below the minimum disables the CTA and shows the
// "At least N devices required" message.
export const ReshareBelowThreshold: Story = {
  args: {
    initialIndex: 0,
    minSelectableIndex: 3,
    submitText: 'Next',
    belowMinSubmitText: 'At least 4 devices required',
  },
}
