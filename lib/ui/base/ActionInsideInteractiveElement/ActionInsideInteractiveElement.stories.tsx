import { Button } from '@lib/ui/buttons/Button'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { EyeIcon } from '../../icons/EyeIcon'
import { ActionInsideInteractiveElement } from '.'

const meta: Meta<typeof ActionInsideInteractiveElement> = {
  title: 'Foundation/ActionInsideInteractiveElement',
  component: ActionInsideInteractiveElement,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },

  argTypes: {
    actionPlacerStyles: { control: 'object' },
    render: { table: { disable: true } },
    action: { table: { disable: true } },
  },

  args: {
    actionPlacerStyles: { top: 8, right: 8 },
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: args => (
    <ActionInsideInteractiveElement
      {...args}
      action={
        <Button size="sm" icon={<EyeIcon />}>
          View
        </Button>
      }
      render={() => (
        <img
          src="https://via.placeholder.com/240x140"
          alt="thumbnail"
          style={{ display: 'block', width: 240, height: 140, borderRadius: 8 }}
        />
      )}
    />
  ),
}

export const CornerActions: Story = {
  parameters: { controls: { hideNoControlsWarning: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
        const style =
          pos === 'top-left'
            ? { top: 8, left: 8 }
            : pos === 'top-right'
              ? { top: 8, right: 8 }
              : pos === 'bottom-left'
                ? { bottom: 8, left: 8 }
                : { bottom: 8, right: 8 }

        return (
          <ActionInsideInteractiveElement
            key={pos}
            actionPlacerStyles={style}
            action={
              <Button size="sm" icon={<EyeIcon />}>
                {pos}
              </Button>
            }
            render={() => (
              <img
                src="https://via.placeholder.com/160x100"
                alt={pos}
                style={{
                  display: 'block',
                  width: 160,
                  height: 100,
                  borderRadius: 8,
                }}
              />
            )}
          />
        )
      })}
    </div>
  ),
}
