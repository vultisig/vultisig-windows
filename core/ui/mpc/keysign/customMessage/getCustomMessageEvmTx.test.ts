import { Chain } from '@vultisig/core-chain/Chain'
import { Transaction } from 'ethers'
import { describe, expect, it } from 'vitest'

import { getCustomMessageEvmTx } from './getCustomMessageEvmTx'
import { getCustomMessageHex } from './getCustomMessageHex'
import { getPersonalSignMessage } from './getPersonalSignMessage'

const tx = Transaction.from({
  type: 2,
  chainId: 1n,
  nonce: 7,
  maxFeePerGas: 2_000_000_000n,
  maxPriorityFeePerGas: 1_000_000_000n,
  gasLimit: 21000n,
  to: '0x000000000000000000000000000000000000dEaD',
  value: 10n ** 18n,
})

const preimage = tx.unsignedSerialized

describe('getCustomMessageEvmTx', () => {
  it('flags a message whose signature would be a transaction signature', () => {
    const payload = {
      method: 'eth_sign',
      message: preimage,
      chain: Chain.Ethereum,
    }

    expect(getCustomMessageHex(payload)).toBe(tx.unsignedHash.slice(2))
    expect(getCustomMessageEvmTx(payload)?.to).toBe(tx.to)
  })

  it('treats a payload without a chain as Ethereum, as the signers do', () => {
    expect(
      getCustomMessageEvmTx({ method: 'eth_sign', message: preimage })
    ).not.toBeNull()
  })

  it('reports the chain the preimage names, not the payload chain', () => {
    expect(
      getCustomMessageEvmTx({
        method: 'eth_sign',
        message: preimage,
        chain: Chain.BSC,
      })?.chainId
    ).toBe(1n)
  })

  it('ignores a personal_sign message inside its EIP-191 envelope', () => {
    expect(
      getCustomMessageEvmTx({
        method: 'personal_sign',
        message: getPersonalSignMessage(preimage),
        chain: Chain.Ethereum,
      })
    ).toBeNull()
  })

  it('ignores chains that do not sign keccak256 of the message', () => {
    expect(
      getCustomMessageEvmTx({
        method: 'sign_message',
        message: preimage,
        chain: Chain.Solana,
      })
    ).toBeNull()
  })

  it('ignores EIP-712 typed data', () => {
    expect(
      getCustomMessageEvmTx({
        method: 'eth_signTypedData_v4',
        message: preimage,
        chain: Chain.Ethereum,
      })
    ).toBeNull()
  })
})
