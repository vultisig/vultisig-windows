import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fragment, useState } from 'react'
import styled from 'styled-components'

import { HStack, VStack } from '.'

const meta: Meta<typeof VStack> = {
  title: 'Foundation/Layout/Stack',
  component: VStack,
  subcomponents: { HStack },
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    children: { table: { disable: true } },
  },
  args: {
    gap: 8,
  },
}
export default meta

type Story = StoryObj<typeof meta>

const Block = styled.div<{ w?: number; h?: number }>`
  width: ${({ w = 60 }) => w}px;
  height: ${({ h = 60 }) => h}px;
  background: #6366f1;
  border-radius: 4px;
`

const blocks = Array.from({ length: 6 }, (_, i) => <Block key={i} />)

export const Vertical: Story = {
  name: 'VStack (vertical)',
  render: args => <VStack {...args}>{blocks}</VStack>,
}

export const Horizontal: Story = {
  name: 'HStack (horizontal)',
  render: args => <HStack {...args}>{blocks}</HStack>,
}

export const Wrap: Story = {
  name: 'Wrapping items',
  render: args => (
    <HStack {...args} wrap="wrap" maxWidth={220} gap={12}>
      {blocks}
    </HStack>
  ),
}

export const AlignCenter: Story = {
  name: 'Centered alignment',
  render: args => (
    <VStack {...args} alignItems="center" justifyContent="center" fullHeight>
      {blocks}
    </VStack>
  ),
}

export const Scrollable: Story = {
  name: 'Scrollable list',
  render: args => (
    <div style={{ height: 140, border: '1px solid #d1d5db', padding: 8 }}>
      <VStack {...args} scrollable gap={8}>
        {Array.from({ length: 20 }, (_, i) => (
          <Block key={i} />
        ))}
      </VStack>
    </div>
  ),
}

export const InteractiveGap: Story = {
  name: 'Interactive gap slider',
  render: args => {
    const [gap, setGap] = useState(8)
    return (
      <Fragment>
        <input
          type="range"
          min={0}
          max={32}
          value={gap}
          onChange={e => setGap(Number(e.target.value))}
          style={{ width: 200, marginBottom: 16 }}
        />
        <VStack {...args} gap={gap}>
          {blocks}
        </VStack>
      </Fragment>
    )
  },
}
