import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getStorageContext } from '../shared/storageContext'
import type { ToolContext } from '../types'
import { handleAddCoin } from './addCoin'

vi.mock('../shared/storageContext', () => ({
  getStorageContext: vi.fn(),
}))

const createCoin = vi.fn()
const context: ToolContext = {
  vaultPubKey: 'vault',
  vaultName: 'QA vault',
  coins: [
    {
      chain: Chain.Ethereum,
      ticker: 'ETH',
      address: '0xsender',
      decimals: 18,
      isNativeToken: true,
    },
  ],
}

describe('handleAddCoin decimal precision', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getStorageContext).mockReturnValue({ createCoin } as never)
  })

  it('refuses an unknown token without explicit decimals', async () => {
    await expect(
      handleAddCoin(
        {
          chain: Chain.Ethereum,
          ticker: 'UNKNOWN',
          contract_address: '0x0000000000000000000000000000000000000001',
        },
        context
      )
    ).rejects.toThrow('decimals is required for unknown token UNKNOWN')
    expect(createCoin).not.toHaveBeenCalled()
  })

  it('persists an unknown token only with valid explicit decimals', async () => {
    await handleAddCoin(
      {
        chain: Chain.Ethereum,
        ticker: 'UNKNOWN',
        contract_address: '0x0000000000000000000000000000000000000001',
        decimals: 6,
      },
      context
    )

    expect(createCoin).toHaveBeenCalledWith(
      expect.objectContaining({
        coin: expect.objectContaining({ decimals: 6 }),
      })
    )
  })

  it.each([-1, 1.5, 256, 'not-a-number', '', null, false])(
    'rejects invalid explicit decimals %j',
    async decimals => {
      await expect(
        handleAddCoin(
          {
            chain: Chain.Ethereum,
            ticker: 'UNKNOWN',
            contract_address: '0x0000000000000000000000000000000000000001',
            decimals,
          },
          context
        )
      ).rejects.toThrow('decimals must be an integer between 0 and 255')
    }
  )
})
