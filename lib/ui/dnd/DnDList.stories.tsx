import { Button } from '@lib/ui/buttons/Button'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DnDList } from './DnDList'

type Fruit = { id: string; name: string }

const initialFruits: Fruit[] = [
  { id: 'apple', name: '🍎 Apple' },
  { id: 'banana', name: '🍌 Banana' },
  { id: 'cherry', name: '🍒 Cherry' },
  { id: 'grape', name: '🍇 Grape' },
]

const meta: Meta<typeof DemoList> = {
  title: 'Foundation/DnDList',
  component: DemoList,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} as const
export default meta

type Story = StoryObj<typeof meta>

function DemoList() {
  const [fruits, setFruits] = useState<Fruit[]>(initialFruits)

  return (
    <DnDList
      items={fruits}
      getItemId={f => f.id}
      onChange={(itemId, { index }) => {
        setFruits(old => {
          const moving = old.find(f => f.id === itemId)!
          const without = old.filter(f => f.id !== itemId)
          const next = [
            ...without.slice(0, index),
            moving,
            ...without.slice(index),
          ]
          return next
        })
      }}
      renderList={({ props }) => (
        <ul
          {...props}
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            width: 220,
          }}
        />
      )}
      renderItem={({ item, draggableProps, dragHandleProps, status }) => (
        <li
          {...draggableProps}
          style={{
            ...draggableProps?.style,
            padding: '8px 12px',
            borderRadius: 6,
            background:
              status === 'overlay'
                ? 'black'
                : status === 'placeholder'
                  ? 'transparent'
                  : 'black',
            border: status === 'overlay' ? '1px dashed #999' : '1px solid #ddd',
            cursor: 'grab',
          }}
        >
          <span {...dragHandleProps} style={{ userSelect: 'none' }}>
            {item.name}
          </span>
        </li>
      )}
    />
  )
}

export const Basic: Story = {}

export const ResetButton: Story = {
  render: () => (
    <>
      <DemoList />
      <Button
        style={{ marginTop: 16 }}
        onClick={() => window.location.reload()}
        kind="secondary"
      >
        Reset Order
      </Button>
    </>
  ),
  parameters: { controls: { hideNoControlsWarning: true } },
}
