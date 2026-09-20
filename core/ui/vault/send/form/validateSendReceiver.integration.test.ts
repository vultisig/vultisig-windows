import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { TFunction } from 'i18next'
import { beforeAll, describe, expect, it } from 'vitest'

import { validateSendReceiver } from './validateSendForm'

// Unmocked: real WalletCore address validation and the SDK's on-curve
// recipient check, so the ordering of burn lookup vs format validation is
// exercised end to end.
const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key) as TFunction

describe('validateSendReceiver WalletCore integration', () => {
  let walletCore: WalletCore

  beforeAll(async () => {
    walletCore = await initWasm()
  })

  it('names the off-curve Solana Incinerator instead of a format error', () => {
    const error = validateSendReceiver({
      receiverAddress: '1nc1nerator11111111111111111111111111111111',
      senderAddress: 'sender',
      chain: Chain.Solana,
      walletCore,
      t,
    })

    expect(error).toContain('send_receiver_dangerous_address')
    expect(error).toContain('Solana Incinerator')
  })

  it('still reports a format error for an unknown off-curve Solana account', () => {
    // Vote program id: a valid base58 key that is not on the ed25519 curve,
    // so no wallet can control it.
    const error = validateSendReceiver({
      receiverAddress: 'Vote111111111111111111111111111111111111111',
      senderAddress: 'sender',
      chain: Chain.Solana,
      walletCore,
      t,
    })

    expect(error).toContain('send_invalid_receiver_address')
    expect(error).not.toContain('send_receiver_dangerous_address')
  })

  it('accepts an ordinary on-curve Solana wallet', () => {
    expect(
      validateSendReceiver({
        receiverAddress: 'GmaDrppBC7P5ARKV8g3djiwP89vz1jLK23V2GBjuAEGB',
        senderAddress: 'sender',
        chain: Chain.Solana,
        walletCore,
        t,
      })
    ).toBeUndefined()
  })
})
