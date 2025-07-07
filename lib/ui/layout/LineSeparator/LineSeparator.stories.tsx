import type { Meta, StoryObj } from '@storybook/react-vite'
import styled from 'styled-components'

import { LineSeparator } from '.'

const meta: Meta<typeof LineSeparator> = {
  title: 'Foundation/Layout/LineSeparator',
  component: LineSeparator,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof meta>

const DemoBlock = styled.div<{ width?: number }>`
  width: ${({ width }) => (width ? `${width}px` : '100%')};
  padding: 16px 0;
  background: ${({ theme }) => theme.colors.background.toCssValue()};
`

export const FullWidth: Story = {
  name: 'Full‑width separator',
  render: () => (
    <DemoBlock>
      <LineSeparator />
    </DemoBlock>
  ),
}

export const InNarrowContainer: Story = {
  name: 'Inside 240‑px container',
  render: () => (
    <DemoBlock width={240}>
      <LineSeparator />
    </DemoBlock>
  ),
}
