import { expect } from '@storybook/jest'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from '@storybook/testing-library'
import { Fragment } from 'react'

import { BoxIcon as SampleIcon } from '../../icons/BoxIcon'
import { IconButton } from './index'

const KINDS = ['link', 'primary', 'secondary'] as const
const STATUSES = ['default', 'success', 'warning', 'danger'] as const
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

const meta: Meta<typeof IconButton> = {
  title: 'Foundation/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    kind: { control: 'radio', options: KINDS },
    status: { control: 'radio', options: STATUSES },
    size: { control: 'radio', options: SIZES },
    loading: { control: 'boolean' },
    disabled: { control: 'text' },
    children: { table: { disable: true } },
  },
  args: {
    kind: 'link',
    status: 'default',
    size: 'md',
    children: <SampleIcon aria-label="icon" />,
    'aria-label': 'icon',
  },
}
export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {KINDS.map(kind => (
        <Fragment key={kind}>
          <strong>{kind}</strong>
          {STATUSES.map(status => (
            <div key={status} style={{ display: 'flex', gap: 12 }}>
              {SIZES.map(size => (
                <IconButton
                  key={size}
                  kind={kind}
                  status={status}
                  size={size}
                  aria-label={`${kind}-${status}-${size}`}
                >
                  <SampleIcon />
                </IconButton>
              ))}
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  ),
  parameters: { controls: { hideNoControlsWarning: true } },
}

export const Loading: Story = { args: { loading: true } }

export const Disabled: Story = {
  args: {
    disabled: 'Action not allowed',
    children: <SampleIcon />,
    'aria-label': 'disabled',
  },
}

export const TogglesLoading: Story = {
  args: { children: <SampleIcon />, 'aria-label': 'toggle-loading' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /toggle-loading/i })
    await userEvent.click(button)
    args.loading = true
    await expect(button).toHaveAttribute('aria-busy', 'true')
  },
}
