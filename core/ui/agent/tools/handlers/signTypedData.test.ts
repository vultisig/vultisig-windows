import { Chain } from '@vultisig/core-chain/Chain'
import { omit } from '@vultisig/lib-utils/record/omit'
import { TypedDataEncoder } from 'ethers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import {
  fastVaultKeysign,
  formatKeysignSignatureHex,
} from '../shared/fastVaultKeysign'
import type { ToolContext } from '../types'
import { handleSignTypedData } from './signTypedData'

vi.mock('../shared/fastVaultKeysign', () => ({
  fastVaultKeysign: vi.fn(),
  formatKeysignSignatureHex: vi.fn(),
}))

const context: ToolContext = {
  vaultPubKey: 'vault',
  vaultName: 'QA vault',
  coins: [],
  vault: {
    password: 'password',
    localPartyId: 'device',
    publicKeyEcdsa: 'ecdsa',
    publicKeyEddsa: 'eddsa',
    hexChainCode: 'chaincode',
    resharePrefix: '',
    libType: 'DKLS',
    signers: ['device', 'server'],
    keyShares: [],
  },
}

const payload = {
  id: 'mail',
  primaryType: 'Mail',
  domain: { name: 'Vultisig', chainId: 1 },
  types: { Mail: [{ name: 'contents', type: 'string' }] },
  message: { contents: 'Hello from Vultisig' },
  chain: Chain.Ethereum,
}

describe('handleSignTypedData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fastVaultKeysign).mockResolvedValue({
      msg: '',
      r: '',
      s: '',
      der_signature: '',
    })
    vi.mocked(formatKeysignSignatureHex).mockReturnValue('0xsignature')
  })

  it('signs the EIP-712 hash of a payload that names its primaryType', async () => {
    await expect(
      handleSignTypedData({ payloads: [payload] }, context)
    ).resolves.toEqual({
      data: { signatures: [{ id: 'mail', signature: '0xsignature' }] },
    })

    expect(fastVaultKeysign).toHaveBeenCalledWith(
      expect.objectContaining({
        messageHash: TypedDataEncoder.hash(
          payload.domain,
          payload.types,
          payload.message
        ).slice(2),
      })
    )
  })

  it('refuses a payload without a primaryType at the schema', async () => {
    await expect(
      handleSignTypedData({ payloads: [omit(payload, 'primaryType')] }, context)
    ).rejects.toBeInstanceOf(z.ZodError)

    expect(fastVaultKeysign).not.toHaveBeenCalled()
  })
})
