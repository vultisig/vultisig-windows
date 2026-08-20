import { getResolvedQuery, Query } from '@lib/ui/query/Query'
import type { Meta, StoryObj } from '@storybook/react-vite'
import styled from 'styled-components'

import { BlockaidTxScanStatus } from './BlockaidTxScanStatus'
import { BlockaidTxScanResult } from './queries/blockaidTxValidation'

const meta = {
  title: 'Chain/Security/BlockaidTxScanStatus',
  component: BlockaidTxScanStatus,
  decorators: [
    Story => (
      <StatusSurface>
        <Story />
      </StatusSurface>
    ),
  ],
} satisfies Meta<typeof BlockaidTxScanStatus>

export default meta
type Story = StoryObj<typeof meta>

const StatusSurface = styled.div`
  width: min(100%, 460px);
  margin: 32px auto;
`

const providerErrorQuery: Query<BlockaidTxScanResult | undefined> = {
  data: undefined,
  error: new Error('Blockaid could not complete the transaction scan'),
  isPending: false,
}

export const ProviderError: Story = {
  args: {
    value: providerErrorQuery,
  },
}

export const Benign: Story = {
  args: {
    value: getResolvedQuery(null),
  },
}
