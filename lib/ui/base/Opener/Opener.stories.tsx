import { Button } from '@lib/ui/buttons/Button'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Opener } from '.'

const meta: Meta<typeof Opener> = {
  title: 'Foundation/Opener',
  component: Opener,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },

  argTypes: {
    renderOpener: { table: { disable: true } },
    renderContent: { table: { disable: true } },
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <Opener
      renderOpener={({ isOpen, onOpen, onClose }) => (
        <Button onClick={isOpen ? onClose : onOpen}>
          {isOpen ? 'Close panel' : 'Open panel'}
        </Button>
      )}
      renderContent={({ onClose }) => (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            border: '1px solid #e1e1e1',
            borderRadius: 8,
            width: 240,
          }}
        >
          <p style={{ margin: 0 }}>Hello from inside!</p>
          <Button kind="secondary" style={{ marginTop: 12 }} onClick={onClose}>
            Dismiss
          </Button>
        </div>
      )}
    />
  ),
}

export const InitiallyOpen: Story = {
  parameters: { controls: { hideNoControlsWarning: true } },
  render: () => (
    <Opener
      initialIsOpen
      renderOpener={({ isOpen, onClose }) => (
        <Button onClick={onClose}>{isOpen ? 'Close' : 'Open'}</Button>
      )}
      renderContent={({ onClose }) => (
        <div
          style={{
            marginTop: 16,
            padding: 24,
            background: '#fafafa',
            borderRadius: 8,
          }}
        >
          <p>Content is open by default.</p>
          <Button kind="secondary" onClick={onClose}>
            Got it
          </Button>
        </div>
      )}
    />
  ),
}
