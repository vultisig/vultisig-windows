import { create, fromBinary } from '@bufbuild/protobuf'
import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { buildSendKeysignPayload } from '@vultisig/core-mpc/keysign/send/build'
import { buildSwapKeysignPayload } from '@vultisig/core-mpc/keysign/swap/build'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getWalletContext } from '../shared/walletContext'
import type { ToolContext } from '../types'
import { handleBuildCustomTx } from './buildCustomTx'
import { handleBuildSendTx } from './buildSendTx'
import { handleBuildSwapTx } from './buildSwapTx'

vi.mock('@vultisig/core-chain/publicKey/getPublicKey', () => ({
  getPublicKey: vi.fn(() => ({ data: () => new Uint8Array() })),
}))

vi.mock('@vultisig/core-chain/swap/quote/findSwapQuote', () => ({
  findSwapQuote: vi.fn(async () => ({
    quote: {
      general: {
        provider: 'test-provider',
        dstAmount: '42',
      },
    },
  })),
}))

vi.mock('@vultisig/core-mpc/keysign/send/build', () => ({
  buildSendKeysignPayload: vi.fn(),
}))

vi.mock('@vultisig/core-mpc/keysign/swap/build', () => ({
  buildSwapKeysignPayload: vi.fn(),
}))

vi.mock('@vultisig/core-mpc/keysign/chainSpecific', () => ({
  getChainSpecific: vi.fn(async () => ({ case: undefined })),
}))

vi.mock('@vultisig/core-mpc/keysign/utxo/getKeysignUtxoInfo', () => ({
  getKeysignUtxoInfo: vi.fn(async () => undefined),
}))

vi.mock('../shared/walletContext', () => ({
  getWalletContext: vi.fn(() => ({
    walletCore: {
      EthereumAbiFunction: {
        createWithString: vi.fn(() => ({})),
      },
      EthereumAbi: {
        encode: vi.fn(() => new Uint8Array()),
      },
    },
    vault: {
      hexChainCode: '',
      publicKeys: {},
      localPartyId: 'party',
      libType: 'DKLS',
      publicKeyEcdsa: 'ecdsa',
    },
  })),
}))

const exactAmount = '0.123456789123456789'
const exactChainAmount = 123456789123456789n

const context: ToolContext = {
  vaultPubKey: 'ecdsa',
  vaultName: 'QA vault',
  coins: [
    {
      chain: 'Ethereum',
      ticker: 'ETH',
      address: '0xsender',
      decimals: 18,
      isNativeToken: true,
    },
    {
      chain: 'Bitcoin',
      ticker: 'BTC',
      address: 'bc1sender',
      decimals: 8,
      isNativeToken: true,
    },
  ],
}

const decodePayload = (value: unknown) =>
  fromBinary(KeysignPayloadSchema, Buffer.from(String(value), 'base64'))

describe('agent transaction amount precision', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(buildSendKeysignPayload).mockImplementation(async input =>
      create(KeysignPayloadSchema, {
        toAddress: input.receiver,
        toAmount: input.amount.toString(),
      })
    )
    vi.mocked(buildSwapKeysignPayload).mockImplementation(async input =>
      create(KeysignPayloadSchema, {
        toAddress: input.toCoin.address,
        toAmount: toChainAmount(
          input.amount,
          input.fromCoin.decimals
        ).toString(),
      })
    )
  })

  it('preserves exact send base units in the decoded payload and review metadata', async () => {
    const result = await handleBuildSendTx(
      {
        chain: 'Ethereum',
        symbol: 'ETH',
        address: '0xrecipient',
        amount: exactAmount,
      },
      context
    )

    expect(decodePayload(result.data.keysign_payload).toAmount).toBe(
      exactChainAmount.toString()
    )
    expect(result.data.amount).toBe(exactAmount)
    expect(buildSendKeysignPayload).toHaveBeenCalledWith(
      expect.objectContaining({ amount: exactChainAmount })
    )
  })

  it('preserves exact swap input through quote and payload construction', async () => {
    const result = await handleBuildSwapTx(
      {
        from_chain: 'Ethereum',
        from_symbol: 'ETH',
        to_chain: 'Bitcoin',
        to_symbol: 'BTC',
        amount: exactAmount,
      },
      context
    )

    expect(decodePayload(result.data.keysign_payload).toAmount).toBe(
      exactChainAmount.toString()
    )
    expect(result.data.amount).toBe(exactAmount)
    expect(buildSwapKeysignPayload).toHaveBeenCalledWith(
      expect.objectContaining({ amount: exactAmount })
    )
  })

  it('preserves exact deposit base units in the decoded payload', async () => {
    const result = await handleBuildCustomTx(
      {
        tx_type: 'deposit',
        chain: 'Ethereum',
        symbol: 'ETH',
        amount: exactAmount,
        memo: 'ADD:ETH.ETH',
      },
      context
    )

    expect(decodePayload(result.data.keysign_payload).toAmount).toBe(
      exactChainAmount.toString()
    )
    expect(result.data.amount).toBe(exactAmount)
  })

  it('preserves exact EVM contract value in the decoded payload', async () => {
    const result = await handleBuildCustomTx(
      {
        tx_type: 'evm_contract',
        chain: 'Ethereum',
        contract_address: '0x0000000000000000000000000000000000000001',
        function_name: 'deposit()',
        value: exactAmount,
        params: [],
      },
      context
    )

    expect(decodePayload(result.data.keysign_payload).toAmount).toBe(
      exactChainAmount.toString()
    )
    expect(result.data.amount).toBe(exactAmount)
  })

  it.each(['-0', '-0.0000000000000000009', '-1e-19'])(
    'rejects negative EVM value %j before wallet access',
    async value => {
      await expect(
        handleBuildCustomTx(
          {
            tx_type: 'evm_contract',
            chain: 'Ethereum',
            contract_address: '0x0000000000000000000000000000000000000001',
            function_name: 'deposit()',
            value,
            params: [],
          },
          context
        )
      ).rejects.toThrow(`Invalid amount: ${value}`)
      expect(getWalletContext).not.toHaveBeenCalled()
    }
  )
})
