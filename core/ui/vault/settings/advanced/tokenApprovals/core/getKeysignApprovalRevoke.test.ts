import { create } from '@bufbuild/protobuf'
import { Chain, EvmChain, OtherChain } from '@vultisig/core-chain/Chain'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { encodeFunctionData, erc20Abi } from 'viem'
import { describe, expect, it } from 'vitest'

import { getKeysignApprovalRevoke } from './getKeysignApprovalRevoke'

const owner = '0x0bd4000000000000000000000000000000003Fe6'
const token = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const spender = '0x000000000022D473030F116dDEE9F6B43aC78BA3'

const approve = (amount: bigint) =>
  encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, amount],
  })

type PayloadInput = {
  chain?: Chain
  memo?: string
}

const payload = ({
  chain = EvmChain.Ethereum,
  memo = approve(0n),
}: PayloadInput = {}) =>
  create(KeysignPayloadSchema, {
    coin: create(CoinSchema, { chain, address: owner }),
    toAddress: token,
    toAmount: '0',
    memo,
  })

describe('getKeysignApprovalRevoke', () => {
  it('reads the allowance an approve-to-zero clears', () => {
    expect(getKeysignApprovalRevoke(payload())).toEqual({
      chain: EvmChain.Ethereum,
      owner,
      token,
      spender,
    })
  })

  it('ignores an approve with a non-zero amount', () => {
    expect(getKeysignApprovalRevoke(payload({ memo: approve(1n) }))).toBeNull()
  })

  it('ignores other calldata and plain memos', () => {
    const transfer = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [spender, 0n],
    })
    expect(getKeysignApprovalRevoke(payload({ memo: transfer }))).toBeNull()
    expect(getKeysignApprovalRevoke(payload({ memo: 'hello' }))).toBeNull()
  })

  it('ignores non-EVM chains', () => {
    expect(
      getKeysignApprovalRevoke(payload({ chain: OtherChain.Solana }))
    ).toBeNull()
  })
})
