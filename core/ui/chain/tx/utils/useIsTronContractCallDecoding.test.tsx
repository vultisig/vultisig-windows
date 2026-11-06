// @vitest-environment happy-dom
import { create } from '@bufbuild/protobuf'
import { ChildrenProp } from '@lib/ui/props'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { TronTriggerSmartContractPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/tron_contract_payload_pb'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getEvmContractCallInfo } = vi.hoisted(() => ({
  getEvmContractCallInfo: vi.fn(),
}))

vi.mock('@vultisig/core-chain/chains/evm/contract/call/info', () => ({
  getEvmContractCallInfo,
}))

import { useIsTronContractCallDecoding } from './useIsTronContractCallDecoding'

const withCalldata = (data: string) =>
  create(KeysignPayloadSchema, {
    contractPayload: {
      case: 'tronTriggerSmartContractPayload',
      value: create(TronTriggerSmartContractPayloadSchema, { data }),
    },
  })

const renderDecoding = (keysignPayload: KeysignPayload | undefined) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useIsTronContractCallDecoding(keysignPayload), {
    wrapper: ({ children }: ChildrenProp) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useIsTronContractCallDecoding', () => {
  beforeEach(() => {
    getEvmContractCallInfo.mockReset()
  })

  it('stays true until the decode resolves', async () => {
    let settle: (value: null) => void = () => {}
    getEvmContractCallInfo.mockReturnValue(
      new Promise(resolve => {
        settle = resolve
      })
    )

    const { result } = renderDecoding(withCalldata('095ea7b3'))
    expect(result.current).toBe(true)

    settle(null)
    await waitFor(() => expect(result.current).toBe(false))
  })

  it('settles when the decode fails', async () => {
    getEvmContractCallInfo.mockRejectedValue(new Error('decode failed'))

    const { result } = renderDecoding(withCalldata('095ea7b3'))

    await waitFor(() => expect(result.current).toBe(false))
  })

  it('is false without a call to decode', () => {
    expect(renderDecoding(undefined).result.current).toBe(false)
    expect(renderDecoding(create(KeysignPayloadSchema)).result.current).toBe(
      false
    )
    expect(getEvmContractCallInfo).not.toHaveBeenCalled()
  })

  it('never holds the review on empty calldata, which no query decodes', () => {
    expect(renderDecoding(withCalldata('0x')).result.current).toBe(false)
    expect(getEvmContractCallInfo).not.toHaveBeenCalled()
  })
})
