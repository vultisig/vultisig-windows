import { FileIcon } from '@lib/ui/icons/FileIcon'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  DropZoneContainer,
  InteractiveDropZoneContainer,
} from './DropZoneContainer'
import { DropZoneContent } from './DropZoneContent'

const meta: Meta<typeof DropZoneContainer> = {
  title: 'Foundation/Inputs/DropZone',
  component: DropZoneContainer,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    children: { table: { disable: true } },
  },
  args: {},
}
export default meta

type Story = StoryObj<typeof meta>

const Content = (
  <DropZoneContent icon={<FileIcon />}>
    Drop files here or click to upload
  </DropZoneContent>
)

export const Static: Story = {
  name: 'Static (dashed box)',
  render: () => <DropZoneContainer>{Content}</DropZoneContainer>,
}

export const Interactive: Story = {
  name: 'Interactive (hover effect)',
  render: () => (
    <InteractiveDropZoneContainer>{Content}</InteractiveDropZoneContainer>
  ),
}
