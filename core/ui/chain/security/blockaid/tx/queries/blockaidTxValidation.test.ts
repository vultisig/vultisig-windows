import { getTxBlockaidValidation } from '@vultisig/core-chain/security/blockaid/tx/validation'
import {
  BlockaidValidation,
  parseBlockaidValidation,
} from '@vultisig/core-chain/security/blockaid/tx/validation/api/core'
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

const input = {} as Parameters<typeof getBlockaidTxValidationQuery>[0]

const runQuery = () => getBlockaidTxValidationQuery(input).queryFn()

describe('getBlockaidTxValidationQuery', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it.each([{ result_type: 'Error' }, { status: 'Error' }])(
    'rejects a provider-side scan error: %o',
    async validation => {
      vi.mocked(getTxBlockaidValidation).mockResolvedValue(
        validation as unknown as BlockaidValidation
      )

      await expect(runQuery()).rejects.toThrow(
        'Blockaid could not complete the transaction scan'
      )
      expect(parseBlockaidValidation).not.toHaveBeenCalled()
    }
  )

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
})
