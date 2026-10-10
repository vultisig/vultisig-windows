import { getCustomMessageHex } from '@core/ui/mpc/keysign/customMessage/getCustomMessageHex'
import { Chain } from '@vultisig/core-chain/Chain'
import { Hex, recoverMessageAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { describe, expect, it } from 'vitest'

import { buildManualCustomMessagePayload } from './buildManualCustomMessagePayload'

const account = privateKeyToAccount(`0x${'11'.repeat(32)}`)

type SignManualMessageInput = {
  method: string
  message: string
}

// Signs the digest the keysign derives from the payload, as the vault would.
const signManualMessage = ({ method, message }: SignManualMessageInput) => {
  const payload = buildManualCustomMessagePayload({
    method,
    message,
    vaultPublicKeyEcdsa: 'vault',
  })
  const digest = getCustomMessageHex({
    chain: Chain.Ethereum,
    method: payload.method,
    message: payload.message,
  })

  return account.sign({ hash: `0x${digest}` })
}

describe('buildManualCustomMessagePayload', () => {
  // Issue #5137: the signature only recovered over keccak256(message).
  it('signs a personal_sign message that EIP-191 verification accepts', async () => {
    const message = 'Hello from Vultisig'

    const signature = await signManualMessage({
      method: 'personal_sign',
      message,
    })

    expect(await recoverMessageAddress({ message, signature })).toBe(
      account.address
    )
  })

  it('signs a personal_sign hex message as its raw bytes', async () => {
    const message: Hex = `0x${'ab'.repeat(32)}`

    const signature = await signManualMessage({
      method: 'personal_sign',
      message,
    })

    expect(
      await recoverMessageAddress({ message: { raw: message }, signature })
    ).toBe(account.address)
  })

  it('treats a method padded with whitespace as personal_sign', async () => {
    const message = 'Hello from Vultisig'

    const signature = await signManualMessage({
      method: ' personal_sign ',
      message,
    })

    expect(await recoverMessageAddress({ message, signature })).toBe(
      account.address
    )
  })

  it('carries other methods and their message unchanged', () => {
    const payload = buildManualCustomMessagePayload({
      method: 'eth_sign',
      message: 'Hello from Vultisig',
      vaultPublicKeyEcdsa: 'vault',
    })

    expect(payload.method).toBe('eth_sign')
    expect(payload.message).toBe('Hello from Vultisig')
  })
})
