import { create } from '@bufbuild/protobuf'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { CustomMessagePayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { Interface, Transaction, TransactionLike } from 'ethers'

import { getPersonalSignMessage } from '../customMessage/getPersonalSignMessage'
import { CustomMessageVerifyContent } from './CustomMessageVerifyContent'

const recipient = '0x000000000000000000000000000000000000dEaD'

const getPreimage = (tx: TransactionLike) =>
  Transaction.from(tx).unsignedSerialized

const getPayload = (message: string, method = 'eth_sign') => ({
  value: create(CustomMessagePayloadSchema, {
    method,
    message,
    chain: Chain.Ethereum,
  }),
})

const transfer = {
  nonce: 7,
  gasLimit: 21000n,
  to: recipient,
  value: 10n ** 18n,
}

const eip1559 = {
  type: 2,
  maxFeePerGas: 2_000_000_000n,
  maxPriorityFeePerGas: 1_000_000_000n,
}

const meta = {
  title: 'Keysign/CustomMessageVerifyContent',
  component: CustomMessageVerifyContent,
  decorators: [
    Story => (
      <QueryClientProvider client={new QueryClient()}>
        <div style={{ padding: 16 }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof CustomMessageVerifyContent>

export default meta

type Story = StoryObj<typeof meta>

export const NativeTransfer: Story = {
  args: getPayload(getPreimage({ ...transfer, ...eip1559, chainId: 1n })),
}

export const TokenTransfer: Story = {
  args: getPayload(
    getPreimage({
      ...transfer,
      type: 0,
      chainId: 56n,
      gasPrice: 1_000_000_000n,
      gasLimit: 60000n,
      to: '0x55d398326f99059fF775485246999027B3197955',
      value: 0n,
      data: new Interface([
        'function transfer(address to, uint256 amount)',
      ]).encodeFunctionData('transfer', [recipient, 5n * 10n ** 18n]),
    })
  ),
}

export const UnknownChain: Story = {
  args: getPayload(
    getPreimage({
      ...transfer,
      type: 1,
      chainId: 99999n,
      gasPrice: 1_000_000_000n,
    })
  ),
}

export const NoReplayProtection: Story = {
  args: getPayload(
    getPreimage({ ...transfer, type: 0, gasPrice: 1_000_000_000n })
  ),
}

export const ContractCreation: Story = {
  args: getPayload(
    getPreimage({
      ...transfer,
      ...eip1559,
      chainId: 1n,
      to: null,
      value: 0n,
      gasLimit: 500000n,
      data: '0x6080604052348015600f57600080fd5b50',
    })
  ),
}

export const PlainMessage: Story = {
  args: getPayload(getPersonalSignMessage('Hello, Vultisig!'), 'personal_sign'),
}
