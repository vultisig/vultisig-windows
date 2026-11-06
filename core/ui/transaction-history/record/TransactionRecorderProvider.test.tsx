// @vitest-environment happy-dom
import { create } from '@bufbuild/protobuf'
import { unknownTxHash } from '@core/ui/chain/tx/unknownTxHash'
import { useKeysignMutationListener } from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import { TW } from '@trustwallet/wallet-core'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useEffect } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TransactionRecorderProvider } from './TransactionRecorderProvider'

const { saveRecord, createRecord } = vi.hoisted(() => ({
  saveRecord: vi.fn(),
  createRecord: vi.fn(),
}))

vi.mock('lottie-react', () => ({ default: () => null }))
vi.mock('@core/ui/storage/transactionHistory', () => ({
  useSaveTransactionRecordMutation: () => ({ mutate: saveRecord }),
  useUpdateTransactionRecordMutation: () => ({ mutate: vi.fn() }),
  useTransactionRecordsQuery: () => ({ data: [], refetch: vi.fn() }),
}))
vi.mock('@core/ui/vault/state/currentVault', () => ({
  useCurrentVault: () => ({}),
}))
vi.mock('@vultisig/core-mpc/vault/Vault', () => ({
  getVaultId: () => 'vault-1',
}))
vi.mock('../../mpc/keysign/state/keysignMessagePayload', () => ({
  useKeysignMessagePayload: () => ({
    keysign: create(KeysignPayloadSchema, { skipBroadcast: true }),
  }),
}))
vi.mock('./createTransactionRecord', () => ({
  createTransactionRecord: createRecord,
}))
vi.mock('./withSolanaDeadline', () => ({
  withSolanaDeadline: async (record: unknown) => record,
}))

const SucceedWith = ({ hash }: { hash: string }) => {
  const { onSuccess } = useKeysignMutationListener()
  useEffect(() => {
    onSuccess?.({
      txs: [{ hash, data: TW.Cosmos.Proto.SigningOutput.create() }],
    })
  }, [onSuccess, hash])
  return null
}

const succeedWith = (hash: string) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <TransactionRecorderProvider>
        <SucceedWith hash={hash} />
      </TransactionRecorderProvider>
    </QueryClientProvider>
  )

describe('TransactionRecorderProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createRecord.mockReturnValue({ id: 'record' })
  })

  it('files a dApp-signed transaction under its hash', async () => {
    succeedWith('ABC123')

    await waitFor(() => expect(saveRecord).toHaveBeenCalledOnce())
    expect(createRecord).toHaveBeenCalledWith(
      expect.objectContaining({ txHash: 'ABC123' })
    )
  })

  it('files no history row for a transaction whose hash is unknown', async () => {
    succeedWith(unknownTxHash)

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(createRecord).not.toHaveBeenCalled()
    expect(saveRecord).not.toHaveBeenCalled()
  })
})
