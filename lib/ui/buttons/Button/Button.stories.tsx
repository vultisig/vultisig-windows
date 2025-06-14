import type { Meta, StoryObj } from '@storybook/react-vite'

import { EyeIcon } from '../../icons/EyeIcon'
import { Button } from '.'

const KINDS = ['primary', 'secondary', 'link'] as const
const STATUSES = ['default', 'success', 'warning', 'danger'] as const
const SIZES = ['sm', 'md'] as const

const meta: Meta<typeof Button> = {
  title: 'Foundation/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    kind: { control: 'radio', options: KINDS },
    status: { control: 'radio', options: STATUSES },
    size: { control: 'radio', options: SIZES },
    loading: { control: 'boolean' },
    disabled: { control: 'text' },
    icon: { table: { disable: true } },
  },
  args: {
    kind: 'primary',
    status: 'default',
    size: 'md',
    children: 'Button',
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {KINDS.map(kind => (
        <div
          key={kind}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <strong>{kind}</strong>
          {STATUSES.map(status => (
            <div key={status} style={{ display: 'flex', gap: 8 }}>
              {SIZES.map(size => (
                <Button key={size} kind={kind} status={status} size={size}>
                  {status}
                </Button>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { hideNoControlsWarning: true } },
}

export const WithIcon: Story = {
  args: {
    icon: <EyeIcon />,
    children: 'Preview',
  },
}

export const Loading: Story = { args: { loading: true } }

export const Disabled: Story = {
  args: { disabled: 'Form invalid', children: 'Submit' },
}
