import { TransactionOverviewItem } from '@core/ui/mpc/keysign/verify/components/TransactionOverviewItem'
import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import type { Meta, StoryObj } from '@storybook/react-vite'
import styled from 'styled-components'

import { TxVaultSourceLabel } from './TxVaultSourceLabel'

const shortName = 'Main Vault'
const longName = 'android swap testing123334343455'
const swapAddress = '5mxQKa...ch2k'
const fullAddress = '5mxQKaJ9vTn3kLpQr7sWxYzA2bCdEfGhJkLmNpQrStUch2k'

const Card = styled(VStack)`
  width: 300px;
  gap: 16px;
  padding: 24px;
  border-radius: 12px;
  background: #061b3a;
  border: 1px solid #11284a;
`

const RowTitle = styled(Text)`
  flex-shrink: 0;
`

const SourceWrapper = styled(HStack)`
  min-width: 0;
  flex-wrap: wrap;
`

const VaultName = styled(Text)`
  min-width: 0;
  flex: 0 1 auto;
  text-align: right;
`

const SourceAddress = styled(MiddleTruncate)`
  flex-shrink: 0;
`

const SwapRow = ({ name }: { name: string }) => (
  <HStack
    fullWidth
    justifyContent="space-between"
    alignItems="center"
    gap={8}
    wrap="nowrap"
  >
    <RowTitle weight="500" size={14} color="shy">
      From
    </RowTitle>
    <TxVaultSourceLabel name={name} address={swapAddress} />
  </HStack>
)

// The deposit verify screens (Bond, Stake) put the label in a ListItem's
// value column; 328px is what the 360px popup leaves the page after padding.
const VerifyList = styled(List)`
  width: 328px;
`

const VerifyRow = ({ name }: { name: string }) => (
  <VerifyList border="gradient" radius={borderRadiusPx.lg}>
    <TransactionOverviewItem
      label="From"
      value={<TxVaultSourceLabel name={name} address={`(${swapAddress})`} />}
    />
  </VerifyList>
)

const PlainRow = ({ name }: { name: string }) => (
  <HStack
    alignItems="center"
    gap={8}
    justifyContent="space-between"
    wrap="nowrap"
  >
    <RowTitle color="shy" weight="500">
      From
    </RowTitle>
    <SourceWrapper alignItems="center" justifyContent="flex-end" gap={4}>
      <VaultName cropped>{name}</VaultName>
      <SourceAddress
        color="textShy"
        text={`(${fullAddress})`}
        weight={500}
        width={96}
      />
    </SourceWrapper>
  </HStack>
)

const meta = {
  title: 'Keysign/TxVaultSourceLabel',
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FromRows: Story = {
  render: () => (
    <VStack gap={24} style={{ padding: 24 }}>
      <VStack gap={8}>
        <Text color="shy" size={12}>
          Swap screen — short name
        </Text>
        <Card data-testid="swap-short">
          <SwapRow name={shortName} />
        </Card>
      </VStack>
      <VStack gap={8}>
        <Text color="shy" size={12}>
          Swap screen — long name
        </Text>
        <Card data-testid="swap-long">
          <SwapRow name={longName} />
        </Card>
      </VStack>
      <VStack gap={8}>
        <Text color="shy" size={12}>
          Send screen — long name
        </Text>
        <Card data-testid="plain-long">
          <PlainRow name={longName} />
        </Card>
      </VStack>
      <VStack gap={8}>
        <Text color="shy" size={12}>
          Bond / Stake verify — short name
        </Text>
        <div data-testid="verify-short">
          <VerifyRow name={shortName} />
        </div>
      </VStack>
      <VStack gap={8}>
        <Text color="shy" size={12}>
          Bond / Stake verify — long name
        </Text>
        <div data-testid="verify-long">
          <VerifyRow name={longName} />
        </div>
      </VStack>
    </VStack>
  ),
}
