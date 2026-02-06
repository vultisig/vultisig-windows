import { expect } from '@storybook/jest'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from '@storybook/testing-library'

import { BoxIcon as SampleIcon } from '../../icons/BoxIcon'
import { PrimaryButtonStatus } from '../ButtonProps'
import { IconButton } from './index'

const KINDS = ['link', 'primary', 'secondary'] as const
const primaryStatuses: PrimaryButtonStatus[] = [
  'default',
  'neutral',
  'success',
  'danger',
]
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

const meta: Meta<typeof IconButton> = {
  title: 'Foundation/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    kind: { control: 'radio', options: KINDS },
    status: { control: 'radio', options: primaryStatuses },
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

export const Playground: Story = {
  args: {
    kind: 'primary',
    status: 'default',
  },
}

export const VariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Primary */}
      <section>
        <h3 style={{ color: '#f0f4fc', marginBottom: 16 }}>Primary</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {primaryStatuses.map(status => (
            <div
              key={status}
              style={{ display: 'flex', gap: 12, alignItems: 'center' }}
            >
              <span style={{ color: '#718096', fontSize: 14, minWidth: 60 }}>
                {status}
              </span>
              {SIZES.map(size => (
                <IconButton
                  key={size}
                  kind="primary"
                  status={status}
                  size={size}
                  aria-label={`primary-${status}-${size}`}
                >
                  <SampleIcon />
                </IconButton>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Secondary */}
      <section>
        <h3 style={{ color: '#f0f4fc', marginBottom: 16 }}>Secondary</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {SIZES.map(size => (
            <IconButton
              key={size}
              kind="secondary"
              size={size}
              aria-label={`secondary-${size}`}
            >
              <SampleIcon />
            </IconButton>
          ))}
        </div>
      </section>

      {/* Link */}
      <section>
        <h3 style={{ color: '#f0f4fc', marginBottom: 16 }}>Link</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {SIZES.map(size => (
            <IconButton
              key={size}
              kind="link"
              size={size}
              aria-label={`link-${size}`}
            >
              <SampleIcon />
            </IconButton>
          ))}
        </div>
      </section>
    </div>
  ),
  parameters: { controls: { hideNoControlsWarning: true } },
}

export const Loading: Story = { args: { kind: 'primary', loading: true } }

export const Disabled: Story = {
  args: {
    kind: 'primary',
    disabled: 'Action not allowed',
    children: <SampleIcon />,
    'aria-label': 'disabled',
  },
}

export const TogglesLoading: Story = {
  args: {
    kind: 'primary',
    children: <SampleIcon />,
    'aria-label': 'toggle-loading',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /toggle-loading/i })
    await userEvent.click(button)
    args.loading = true
    await expect(button).toHaveAttribute('aria-busy', 'true')
  },
}
