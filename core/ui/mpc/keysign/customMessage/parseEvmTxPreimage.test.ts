import {
  concat,
  encodeRlp,
  getBytes,
  Interface,
  toUtf8Bytes,
  Transaction,
  TransactionLike,
  Wallet,
} from 'ethers'
import { describe, expect, it } from 'vitest'

import { parseEvmTxPreimage } from './parseEvmTxPreimage'

const recipient = '0x000000000000000000000000000000000000dEaD'
const oneEther = 10n ** 18n

const transfer = {
  nonce: 7,
  gasLimit: 21000n,
  to: recipient,
  value: oneEther,
  data: '0x',
}

const eip1559Transfer = {
  ...transfer,
  type: 2,
  chainId: 1n,
  maxFeePerGas: 2_000_000_000n,
  maxPriorityFeePerGas: 1_000_000_000n,
}

const getPreimage = (tx: TransactionLike) =>
  getBytes(Transaction.from(tx).unsignedSerialized)

const getSignedTx = (tx: TransactionLike) => {
  const signed = Transaction.from(tx)
  signed.signature = Wallet.createRandom().signingKey.sign(signed.unsignedHash)
  return getBytes(signed.serialized)
}

const erc20TransferData = new Interface([
  'function transfer(address to, uint256 amount)',
]).encodeFunctionData('transfer', [recipient, 5n])

describe('parseEvmTxPreimage', () => {
  it('reads an EIP-1559 preimage', () => {
    expect(parseEvmTxPreimage(getPreimage(eip1559Transfer))).toEqual({
      chainId: 1n,
      to: recipient,
      value: oneEther,
      data: '0x',
    })
  })

  it('reads an EIP-2930 preimage', () => {
    const preimage = getPreimage({
      ...transfer,
      type: 1,
      chainId: 56n,
      gasPrice: 1_000_000_000n,
    })

    expect(parseEvmTxPreimage(preimage)).toEqual({
      chainId: 56n,
      to: recipient,
      value: oneEther,
      data: '0x',
    })
  })

  it('reads a legacy EIP-155 preimage', () => {
    const preimage = getPreimage({
      ...transfer,
      type: 0,
      chainId: 137n,
      gasPrice: 1_000_000_000n,
    })

    expect(parseEvmTxPreimage(preimage)).toEqual({
      chainId: 137n,
      to: recipient,
      value: oneEther,
      data: '0x',
    })
  })

  it('reads a pre-EIP-155 legacy preimage as naming no chain', () => {
    const preimage = getPreimage({
      ...transfer,
      type: 0,
      gasPrice: 1_000_000_000n,
    })

    expect(parseEvmTxPreimage(preimage)?.chainId).toBeNull()
  })

  it('keeps the calldata of a contract call', () => {
    const preimage = getPreimage({
      ...eip1559Transfer,
      value: 0n,
      data: erc20TransferData,
    })

    expect(parseEvmTxPreimage(preimage)).toMatchObject({
      value: 0n,
      data: erc20TransferData,
    })
  })

  it('reads a contract creation as having no recipient', () => {
    const preimage = getPreimage({
      ...eip1559Transfer,
      to: null,
      data: '0x6080',
    })

    expect(parseEvmTxPreimage(preimage)?.to).toBeNull()
  })

  it('rejects a signed EIP-1559 transaction', () => {
    expect(parseEvmTxPreimage(getSignedTx(eip1559Transfer))).toBeNull()
  })

  it('rejects a signed EIP-2930 transaction', () => {
    const signed = getSignedTx({
      ...transfer,
      type: 1,
      chainId: 1n,
      gasPrice: 1_000_000_000n,
    })

    expect(parseEvmTxPreimage(signed)).toBeNull()
  })

  it('rejects a signed legacy transaction', () => {
    const signed = getSignedTx({
      ...transfer,
      type: 0,
      chainId: 1n,
      gasPrice: 1_000_000_000n,
    })

    expect(parseEvmTxPreimage(signed)).toBeNull()
  })

  it('rejects a recipient that is not 20 bytes', () => {
    const preimage = concat([
      '0x02',
      encodeRlp([
        '0x01',
        '0x07',
        '0x01',
        '0x02',
        '0x5208',
        '0xdead',
        '0x',
        '0x',
        [],
      ]),
    ])

    expect(parseEvmTxPreimage(getBytes(preimage))).toBeNull()
  })

  it('rejects a list where a field should be bytes', () => {
    const preimage = concat([
      '0x02',
      encodeRlp([
        '0x01',
        '0x07',
        '0x01',
        '0x02',
        '0x5208',
        recipient,
        ['0x01'],
        '0x',
        [],
      ]),
    ])

    expect(parseEvmTxPreimage(getBytes(preimage))).toBeNull()
  })

  it('rejects a typed envelope with the wrong field count', () => {
    const preimage = concat([
      '0x02',
      encodeRlp(['0x01', '0x07', '0x01', '0x5208', recipient, '0x', '0x', []]),
    ])

    expect(parseEvmTxPreimage(getBytes(preimage))).toBeNull()
  })

  it('rejects a preimage followed by trailing bytes', () => {
    const preimage = concat([getPreimage(eip1559Transfer), '0x00'])

    expect(parseEvmTxPreimage(getBytes(preimage))).toBeNull()
  })

  it('rejects input that is not a transaction', () => {
    const hash = getBytes(Transaction.from(eip1559Transfer).unsignedHash)

    expect(parseEvmTxPreimage(hash)).toBeNull()
    expect(parseEvmTxPreimage(getBytes(erc20TransferData))).toBeNull()
    expect(parseEvmTxPreimage(toUtf8Bytes('hello world'))).toBeNull()
    expect(parseEvmTxPreimage(new Uint8Array())).toBeNull()
  })
})
