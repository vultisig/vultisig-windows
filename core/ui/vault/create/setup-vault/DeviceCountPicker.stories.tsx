import { ReshareThresholdNotMetCard } from '@core/ui/mpc/keygen/reshare/ReshareThresholdNotMetCard'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
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

// Larger vault (5 devices, min 4): dragging below the minimum disables the CTA
// and draws the "Threshold not met" card over the picker.
export const ReshareThresholdNotMet: Story = {
  args: {
    initialIndex: 0,
    minSelectableIndex: 3,
    submitText: 'Next',
    belowMinSubmitText: 'At least 4 devices required',
    renderBelowMin: selectedIndex => (
      <VStack
        alignItems="center"
        gap={16}
        style={{ padding: '12px 16px 0', width: '100%' }}
      >
        <Text color="shy" size={13} weight={500} centerHorizontally>
          More devices required
        </Text>
        <ReshareThresholdNotMetCard
          fromDeviceCount={5}
          toDeviceCount={selectedIndex + 1}
          requiredSigners={3}
        />
      </VStack>
    ),
  },
}
