import { UtxoChain } from '@vultisig/core-chain/Chain'
import { getTxBlockaidValidation } from '@vultisig/core-chain/security/blockaid/tx/validation'
import {
  BlockaidValidation,
  parseBlockaidValidation,
} from '@vultisig/core-chain/security/blockaid/tx/validation/api/core'
import { BlockaidTxValidationInput } from '@vultisig/core-chain/security/blockaid/tx/validation/resolver'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getBlockaidTxValidationQuery } from './blockaidTxValidation'

vi.mock('@vultisig/core-chain/security/blockaid/tx/validation', () => ({
  getTxBlockaidValidation: vi.fn(),
}))

vi.mock(
  '@vultisig/core-chain/security/blockaid/tx/validation/api/core',
  () => ({
    parseBlockaidValidation: vi.fn(),
  })
)

const input = {
  chain: UtxoChain.Bitcoin,
  data: { raw_transaction: 'synthetic-transaction' },
} satisfies BlockaidTxValidationInput

const runQuery = () => getBlockaidTxValidationQuery(input).queryFn()

describe('getBlockaidTxValidationQuery', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it.each([
    { result_type: 'Error' },
    { result_type: 'error' },
    { result_type: 'eRrOr' },
    { result_type: 'Benign', status: 'Error' },
    { result_type: 'Benign', status: 'error' },
    { result_type: 'Benign', status: 'eRrOr' },
  ])('rejects a provider-side scan error: %o', async validation => {
    vi.mocked(getTxBlockaidValidation).mockResolvedValue(validation)

    await expect(runQuery()).rejects.toThrow(
      'Blockaid could not complete the transaction scan'
    )
    expect(getTxBlockaidValidation).toHaveBeenCalledWith(input)
    expect(parseBlockaidValidation).not.toHaveBeenCalled()
  })

  it('preserves a successful benign scan result', async () => {
    const validation: BlockaidValidation = { result_type: 'Benign' }
    vi.mocked(getTxBlockaidValidation).mockResolvedValue(validation)
    vi.mocked(parseBlockaidValidation).mockReturnValue(null)

    await expect(runQuery()).resolves.toBeNull()
    expect(parseBlockaidValidation).toHaveBeenCalledWith(validation)
  })

  it('preserves a successful risky scan result and description', async () => {
    const validation: BlockaidValidation = {
      result_type: 'Malicious',
      description: 'Known malicious destination',
    }
    vi.mocked(getTxBlockaidValidation).mockResolvedValue(validation)
    vi.mocked(parseBlockaidValidation).mockReturnValue({
      level: 'high',
    })

    await expect(runQuery()).resolves.toEqual({
      level: 'high',
      description: 'Known malicious destination',
    })
  })

  it('always reaches a verdict the sign button can act on', () => {
    const { networkMode, retry } = getBlockaidTxValidationQuery(input)

    // `online` would park the query in `pending` while the device reports
    // itself offline, leaving the sign button disabled with no way out.
    expect(networkMode).toBe('always')
    expect(retry).toBe(1)
  })
})
