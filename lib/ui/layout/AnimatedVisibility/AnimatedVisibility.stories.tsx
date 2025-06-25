import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { AnimatedVisibility } from '.'

const meta: Meta<typeof AnimatedVisibility> = {
  title: 'Foundation/AnimatedVisibility',
  component: AnimatedVisibility,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    children: { table: { disable: true } },
    customAnimationConfig: { table: { disable: true } },
    onAnimationComplete: { table: { disable: true } },
  },
  args: {
    isOpen: true,
    animationConfig: 'scale',
    delay: 0,
  },
}
export default meta

type Story = StoryObj<typeof meta>

const Box = (
  <div
    style={{
      width: 120,
      height: 120,
      background: '#4f46e5',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    }}
  >
    Popup
  </div>
)

export const Scale: Story = {
  name: 'Scale animation',
  render: args => <AnimatedVisibility {...args}>{Box}</AnimatedVisibility>,
}

export const TopToBottom: Story = {
  name: 'Top to bottom animation',
  render: args => (
    <AnimatedVisibility {...args} animationConfig="topToBottom">
      {Box}
    </AnimatedVisibility>
  ),
}

export const BottomToTop: Story = {
  name: 'Bottom to top animation',
  render: args => (
    <AnimatedVisibility {...args} animationConfig="bottomToTop">
      {Box}
    </AnimatedVisibility>
  ),
}

export const WithDelay: Story = {
  name: 'Delay 500ms',
  render: args => (
    <AnimatedVisibility {...args} delay={500}>
      {Box}
    </AnimatedVisibility>
  ),
}

export const Toggle: Story = {
  name: 'Interactive toggle',
  render: args => {
    const [open, setOpen] = useState(true)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <button onClick={() => setOpen(v => !v)}>
          {open ? 'Hide' : 'Show'}
        </button>
        <AnimatedVisibility {...args} isOpen={open}>
          {Box}
        </AnimatedVisibility>
      </div>
    )
  },
}
