import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Modal } from '.'

const meta: Meta<typeof Modal> = {
  title: 'Foundation/Modals/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    children: { table: { disable: true } },
    onClose: { action: 'close' },
    title: { control: 'text' },
    subTitle: { control: 'text' },
    placement: {
      control: 'radio',
      options: ['center', 'top', 'bottom'],
    },
    targetWidth: { control: { type: 'number', min: 280, max: 800, step: 20 } },
    titleAlign: { control: 'radio', options: ['left', 'center', 'right'] },
    withDefaultStructure: { control: 'boolean' },
    footer: { table: { disable: true } },
  },
  args: {
    title: 'Modal title',
    subTitle: undefined,
    placement: 'center',
    targetWidth: 480,
    titleAlign: 'left',
    withDefaultStructure: true,
  },
}
export default meta

type Story = StoryObj<typeof meta>

const Template: Story = {
  render: args => {
    const [open, setOpen] = useState(false)
    return (
      <VStack gap={16} alignItems="center">
        <Button kind="primary" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        {open && (
          <Modal
            {...args}
            onClose={() => {
              args.onClose?.()
              setOpen(false)
            }}
          >
            {args.children ?? (
              <Text size={14} color="regular">
                Default modal body content. You can change this via the SB
                Controls panel (&quot;children&quot; is disabled by default for
                clarity).
              </Text>
            )}
          </Modal>
        )}
      </VStack>
    )
  },
}

export const Playground: Story = { ...Template }

export const WithSubtitleAndFooter: Story = {
  ...Template,
  name: 'With subtitle & footer',
  args: {
    subTitle: 'Be careful – this action cannot be undone.',
    footer: (
      <HStack gap={12} justifyContent="flex-end">
        <Button kind="secondary" onClick={() => {}}>
          Cancel
        </Button>
        <Button kind="primary" onClick={() => {}}>
          Confirm
        </Button>
      </HStack>
    ),
  },
}

export const CenteredTitle: Story = {
  ...Template,
  args: { titleAlign: 'center' },
}

export const TopPlacement: Story = {
  ...Template,
  args: { placement: 'top' },
}

export const WithoutStructure: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <VStack gap={16} alignItems="center">
        <Button kind="primary" onClick={() => setOpen(true)}>
          Open raw modal
        </Button>
        {open && (
          <Modal
            title="Modal title"
            withDefaultStructure={false}
            onClose={() => setOpen(false)}
          >
            <div style={{ padding: 32 }}>
              <Text size={16} weight="600">
                Custom content
              </Text>
              <Text size={14}>Rendered without default structure wrapper.</Text>
            </div>
          </Modal>
        )}
      </VStack>
    )
  },
  name: 'withDefaultStructure = false',
}
