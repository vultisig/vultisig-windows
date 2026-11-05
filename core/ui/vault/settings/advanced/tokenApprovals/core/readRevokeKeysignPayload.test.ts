import { create } from '@bufbuild/protobuf'
import {
  createTransferInstruction,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token'
import {
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { EvmChain, OtherChain } from '@vultisig/core-chain/Chain'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { Erc20ApprovePayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/erc20_approve_payload_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignSolanaSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { Address, encodeFunctionData, erc20Abi, getAddress } from 'viem'
import { describe, expect, it, vi } from 'vitest'

import { buildSplRevokeKeysignPayload } from './buildSplRevokeKeysignPayload'
import { getEvmRevokeCall } from './getEvmRevokeCall'
import { permit2Abi, permit2Address } from './permit2'
import { readRevokeKeysignPayload } from './readRevokeKeysignPayload'
import { Erc20Approval, SplDelegateApproval } from './TokenApproval'

const blockhash = Keypair.generate().publicKey.toBase58()

vi.mock('@vultisig/core-chain/chains/solana/client', () => ({
  getSolanaClient: () => ({
    getLatestBlockhash: async () => ({ blockhash, lastValidBlockHeight: 1 }),
  }),
}))

const evmOwner = getAddress('0x0bd4000000000000000000000000000000003fe6')
const usdt = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const router = getAddress('0x66a9893cc07d91d95644aedd05d03f95e1dba8af')

const erc20Approval: Erc20Approval = {
  kind: 'erc20',
  token: { chain: EvmChain.Ethereum, id: usdt, ticker: 'USDT', decimals: 6 },
  spender: router,
  allowance: 1n,
}

type EvmPayloadInput = {
  toAddress: string
  memo: string
  toAmount?: string
}

const evmPayload = ({ toAddress, memo, toAmount = '0' }: EvmPayloadInput) =>
  create(KeysignPayloadSchema, {
    coin: create(CoinSchema, { chain: EvmChain.Ethereum, address: evmOwner }),
    toAddress,
    toAmount,
    memo,
  })

const fromRevokeCall = (call: ReturnType<typeof getEvmRevokeCall>) =>
  evmPayload({ toAddress: call.receiver, memo: call.calldata })

const lockdown = (pairs: { token: Address; spender: Address }[]) =>
  encodeFunctionData({
    abi: permit2Abi,
    functionName: 'lockdown',
    args: [pairs],
  })

describe('readRevokeKeysignPayload: EVM', () => {
  it('reads back the ERC-20 revoke it builds', () => {
    expect(
      readRevokeKeysignPayload(fromRevokeCall(getEvmRevokeCall(erc20Approval)))
    ).toEqual({
      kind: 'erc20',
      chain: EvmChain.Ethereum,
      owner: evmOwner,
      token: usdt,
      spender: router,
    })
  })

  it('reads back the Permit2 revoke it builds', () => {
    expect(
      readRevokeKeysignPayload(
        fromRevokeCall(
          getEvmRevokeCall({ ...erc20Approval, kind: 'permit2', expiration: 1 })
        )
      )
    ).toEqual({
      kind: 'permit2',
      chain: EvmChain.Ethereum,
      owner: evmOwner,
      token: usdt,
      spender: router,
    })
  })

  it('rejects a call that grants, moves value or targets another contract', () => {
    const grant = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [router, 1n],
    })
    const { calldata: revoke } = getEvmRevokeCall(erc20Approval)
    const singlePair = lockdown([{ token: usdt, spender: router }])

    expect(
      readRevokeKeysignPayload(evmPayload({ toAddress: usdt, memo: grant }))
    ).toBeNull()
    expect(
      readRevokeKeysignPayload(
        evmPayload({ toAddress: usdt, memo: revoke, toAmount: '1' })
      )
    ).toBeNull()
    expect(
      readRevokeKeysignPayload(
        evmPayload({ toAddress: usdt, memo: singlePair })
      )
    ).toBeNull()
    expect(
      readRevokeKeysignPayload(
        evmPayload({
          toAddress: permit2Address,
          memo: lockdown([
            { token: usdt, spender: router },
            { token: usdt, spender: evmOwner },
          ]),
        })
      )
    ).toBeNull()
    expect(
      readRevokeKeysignPayload(evmPayload({ toAddress: usdt, memo: 'hello' }))
    ).toBeNull()
  })

  it('rejects a revoke that also carries an approve the signer would sign', () => {
    const payload = fromRevokeCall(getEvmRevokeCall(erc20Approval))
    payload.erc20ApprovePayload = create(Erc20ApprovePayloadSchema, {
      spender: evmOwner,
      amount: (2n ** 256n - 1n).toString(),
    })
    expect(readRevokeKeysignPayload(payload)).toBeNull()
  })
})

describe('readRevokeKeysignPayload: Solana', () => {
  const owner = Keypair.generate().publicKey.toBase58()
  const tokenAccount = Keypair.generate().publicKey.toBase58()

  const approval: SplDelegateApproval = {
    kind: 'splDelegate',
    token: {
      chain: OtherChain.Solana,
      id: Keypair.generate().publicKey.toBase58(),
      ticker: 'BONK',
      decimals: 5,
    },
    spender: Keypair.generate().publicKey.toBase58(),
    allowance: 1n,
    tokenAccount,
    programId: TOKEN_2022_PROGRAM_ID.toBase58(),
  }

  const build = (payloadOwner: string) =>
    buildSplRevokeKeysignPayload({
      approval,
      owner: payloadOwner,
      hexPublicKey: '00',
      vaultId: 'vault',
      localPartyId: 'party',
      libType: 'DKLS',
    })

  it('reads back the SPL revoke it builds', async () => {
    expect(readRevokeKeysignPayload(await build(owner))).toEqual({
      kind: 'splDelegate',
      chain: OtherChain.Solana,
      owner,
      tokenAccount,
    })
  })

  it('rejects a transfer, and a revoke signed by another account', async () => {
    const payload = await build(owner)
    const ownerKey = new PublicKey(owner)
    const transfer = new TransactionMessage({
      payerKey: ownerKey,
      recentBlockhash: blockhash,
      instructions: [
        createTransferInstruction(
          new PublicKey(tokenAccount),
          new PublicKey(approval.spender),
          ownerKey,
          1n
        ),
      ],
    }).compileToLegacyMessage()
    payload.signData = {
      case: 'signSolana',
      value: create(SignSolanaSchema, {
        rawTransactions: [
          Buffer.from(new VersionedTransaction(transfer).serialize()).toString(
            'base64'
          ),
        ],
      }),
    }
    expect(readRevokeKeysignPayload(payload)).toBeNull()

    const foreign = await build(Keypair.generate().publicKey.toBase58())
    foreign.coin = create(CoinSchema, {
      chain: OtherChain.Solana,
      address: owner,
    })
    expect(readRevokeKeysignPayload(foreign)).toBeNull()
  })
})
