import { Button } from '@lib/ui/buttons/Button'
import { Text } from '@lib/ui/text'
import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'

import { SelectItemModal } from '.'

const ASSETS = [
  { id: 'btc', name: 'Bitcoin', chain: 'BTC' },
  { id: 'eth', name: 'Ethereum', chain: 'ETH' },
  { id: 'sol', name: 'Solana', chain: 'SOL' },
  { id: 'dot', name: 'Polkadot', chain: 'DOT' },
] as const

type Asset = (typeof ASSETS)[number]

const AssetOption: React.FC<{ value: Asset; onClick: () => void }> = ({
  value,
  onClick,
}) => (
  <Button kind="secondary" onClick={onClick}>
    {value.name}
  </Button>
)

const filterByName = (asset: Asset, query: string) =>
  asset.name.toLowerCase().includes(query.toLowerCase())

const meta: Meta<typeof SelectItemModal<Asset>> = {
  title: 'Foundation/Modals/SelectItemModal',
  component: SelectItemModal,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    options: { table: { disable: true } },
    optionComponent: { table: { disable: true } },
    filterFunction: { table: { disable: true } },
    renderListHeader: { table: { disable: true } },
    onFinish: { action: 'finish' },
    title: { control: 'text' },
  },
  args: {
    title: 'Select asset',
  },
}
export default meta

type Story = StoryObj<typeof meta>

const ModalOpener: React.FC<{
  storyArgs: any
  header?: () => React.ReactNode
}> = ({ storyArgs, header }) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Asset | undefined>()

  return (
    <>
      <Button kind="primary" onClick={() => setOpen(true)}>
        {selected ? `Selected: ${selected.name}` : 'Open modal'}
      </Button>
      {open && (
        <SelectItemModal<Asset>
          {...storyArgs}
          options={ASSETS}
          optionComponent={AssetOption}
          filterFunction={filterByName}
          renderListHeader={header}
          onFinish={asset => {
            storyArgs.onFinish?.(asset)
            if (asset) setSelected(asset)
            setOpen(false)
          }}
        />
      )}
    </>
  )
}

export const Playground: Story = {
  render: args => <ModalOpener storyArgs={args} />,
}

export const WithHeader: Story = {
  render: args => (
    <ModalOpener
      storyArgs={args}
      header={() => (
        <Text weight="600" size={14} color="regular">
          Popular assets
        </Text>
      )}
    />
  ),
  name: 'With list header',
}

export const EmptyFilterState: Story = {
  render: args => (
    <ModalOpener
      storyArgs={{ ...args, title: 'Try searching for XYZ' }}
      header={() => null}
    />
  ),
  name: 'Empty filter (type zzz)',
}
