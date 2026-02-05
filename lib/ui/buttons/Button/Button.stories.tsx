import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fragment } from 'react'

import { EyeIcon } from '../../icons/EyeIcon'
import { Button } from '.'
import { PrimaryButtonStatus } from '../ButtonProps'

const PRIMARY_STATUSES: PrimaryButtonStatus[] = [
  'default',
  'neutral',
  'success',
  'danger',
]
const SIZES = ['sm', 'md'] as const

const meta: Meta<typeof Button> = {
  title: 'Foundation/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    kind: { control: 'radio', options: ['primary', 'secondary', 'link'] },
    status: { control: 'radio', options: PRIMARY_STATUSES },
    size: { control: 'radio', options: SIZES },
    loading: { control: 'boolean' },
    disabled: { control: 'text' },
    icon: { table: { disable: true } },
  },
}
export default meta

type Story = StoryObj<typeof Button>

export const Playground: Story = {
  args: {
    kind: 'primary',
    status: 'default',
    size: 'md',
    children: 'Get started',
  },
}

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Primary variants */}
      <section>
        <h3 style={{ color: '#f0f4fc', marginBottom: 16 }}>Primary</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr 1fr',
            gap: '16px 24px',
            alignItems: 'center',
          }}
        >
          {/* Header row */}
          <span />
          <span style={{ color: '#718096', fontSize: 12, textAlign: 'center' }}>
            sm
          </span>
          <span style={{ color: '#718096', fontSize: 12, textAlign: 'center' }}>
            md
          </span>

          {PRIMARY_STATUSES.map(status => (
            <Fragment key={status}>
              <span style={{ color: '#718096', fontSize: 14, minWidth: 60 }}>
                {status}
              </span>
              {SIZES.map(size => (
                <div key={size}>
                  <Button kind="primary" status={status} size={size}>
                    Get started
                  </Button>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </section>

      {/* Secondary */}
      <section>
        <h3 style={{ color: '#f0f4fc', marginBottom: 16 }}>Secondary</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px 24px',
            alignItems: 'center',
            maxWidth: 400,
          }}
        >
          <span style={{ color: '#718096', fontSize: 12, textAlign: 'center' }}>
            sm
          </span>
          <span style={{ color: '#718096', fontSize: 12, textAlign: 'center' }}>
            md
          </span>
          {SIZES.map(size => (
            <Button key={size} kind="secondary" size={size}>
              Get started
            </Button>
          ))}
        </div>
      </section>

      {/* Link */}
      <section>
        <h3 style={{ color: '#f0f4fc', marginBottom: 16 }}>Link</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px 24px',
            alignItems: 'center',
            maxWidth: 400,
          }}
        >
          <span style={{ color: '#718096', fontSize: 12, textAlign: 'center' }}>
            sm
          </span>
          <span style={{ color: '#718096', fontSize: 12, textAlign: 'center' }}>
            md
          </span>
          {SIZES.map(size => (
            <Button key={size} kind="link" size={size}>
              Get started
            </Button>
          ))}
        </div>
      </section>
    </div>
  ),
}

export const WithIcon: Story = {
  args: {
    kind: 'primary',
    status: 'default',
    icon: <EyeIcon />,
    children: 'Preview',
  },
}

export const Loading: Story = {
  args: {
    kind: 'primary',
    status: 'default',
    loading: true,
    children: 'Button',
  },
}

export const Disabled: Story = {
  args: {
    kind: 'primary',
    status: 'default',
    disabled: 'Form invalid',
    children: 'Submit',
  },
}
