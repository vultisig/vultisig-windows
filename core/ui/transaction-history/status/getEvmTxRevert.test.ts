import { EvmChain } from '@vultisig/core-chain/Chain'
import {
  type Address,
  CallExecutionError,
  ExecutionRevertedError,
  type Hex,
  HttpRequestError,
  RpcRequestError,
} from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetEvmClient } = vi.hoisted(() => ({
  mockGetEvmClient: vi.fn(),
}))

vi.mock('@vultisig/core-chain/chains/evm/client', () => ({
  getEvmClient: mockGetEvmClient,
}))

import { getEvmTxRevert } from './getEvmTxRevert'

const txHash =
  '0x1111111111111111111111111111111111111111111111111111111111111111'

const transaction = {
  from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
  to: '0x1111111254EEB25477B68fb85Ed929f73A960582',
  input: '0x12aa3caf',
  value: 0n,
  gas: 300000n,
  blockNumber: 21000000n,
} satisfies {
  from: Address
  to: Address
  input: Hex
  value: bigint
  gas: bigint
  blockNumber: bigint
}

const callArgs = {
  account: transaction.from,
  to: transaction.to,
  data: transaction.input,
  value: transaction.value,
  gas: transaction.gas,
  blockNumber: transaction.blockNumber,
}

const revertError = () =>
  new CallExecutionError(
    new ExecutionRevertedError({
      message: 'execution reverted: Return amount is not enough',
    }),
    callArgs
  )

type SetUpClientInput = {
  status?: 'success' | 'reverted'
  callError?: unknown
}

const setUpClient = ({ status = 'reverted', callError }: SetUpClientInput) => {
  const call = vi.fn(() =>
    callError === undefined
      ? Promise.resolve({ data: '0x' })
      : Promise.reject(callError)
  )

  mockGetEvmClient.mockReturnValue({
    getTransactionReceipt: vi.fn(() => Promise.resolve({ status })),
    getTransaction: vi.fn(() => Promise.resolve(transaction)),
    call,
  })

  return { call }
}

const getRevert = () => getEvmTxRevert({ chain: EvmChain.Ethereum, txHash })

describe('getEvmTxRevert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reports the revert of a transaction the chain says reverted', async () => {
    setUpClient({ callError: revertError() })

    const revert = await getRevert()

    expect(revert?.text).toContain('Return amount is not enough')
  })

  it('never replays a transaction the chain says succeeded', async () => {
    const { call } = setUpClient({
      status: 'success',
      callError: revertError(),
    })

    await expect(getRevert()).resolves.toBeUndefined()
    expect(call).not.toHaveBeenCalled()
  })

  it('stays silent when the lookup itself failed rather than the EVM', async () => {
    setUpClient({
      callError: new CallExecutionError(
        new HttpRequestError({
          url: 'https://rpc.example',
          status: 429,
          details: 'Too Many Requests',
        }),
        callArgs
      ),
    })

    await expect(getRevert()).resolves.toBeUndefined()
  })

  it('stays silent when the node cannot replay the block', async () => {
    setUpClient({
      callError: new CallExecutionError(
        new RpcRequestError({
          body: {},
          error: { code: -32000, message: 'missing trie node' },
          url: 'https://rpc.example',
        }),
        callArgs
      ),
    })

    await expect(getRevert()).resolves.toBeUndefined()
  })

  it('stays silent when the replay reproduces no failure at all', async () => {
    setUpClient({})

    await expect(getRevert()).resolves.toBeUndefined()
  })
})
