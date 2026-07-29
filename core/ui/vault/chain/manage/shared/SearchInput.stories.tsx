import { SearchField } from '@lib/ui/search/SearchField'
import { Text } from '@lib/ui/text'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import styled from 'styled-components'

import { CoreProvider, CoreState } from '../../../../state/core'
import { SearchInput } from './SearchInput'

const meta = {
  title: 'Vault/Search/PersistentLens',
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta
type Story = StoryObj

const Surface = styled.div`
  display: grid;
  gap: 24px;
  width: 360px;
`

const Field = styled.div`
  display: grid;
  gap: 8px;
`

const coreState = {
  getClipboardText: async () => '',
} as CoreState

const InteractiveSearchFields = () => {
  const [searchInputValue, setSearchInputValue] = useState('')

  return (
    <CoreProvider value={coreState}>
      <Surface>
        <Field data-testid="search-field-surface">
          <Text color="shy" size={13}>
            SearchField
          </Text>
          <SearchField autoFocus={false} />
        </Field>
        <Field data-testid="search-input-surface">
          <Text color="shy" size={13}>
            SearchInput
          </Text>
          <SearchInput
            data-testid="search-input-control"
            value={searchInputValue}
            onChange={setSearchInputValue}
          />
        </Field>
      </Surface>
    </CoreProvider>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveSearchFields />,
}
