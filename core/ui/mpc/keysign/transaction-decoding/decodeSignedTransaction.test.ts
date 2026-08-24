import { create } from '@bufbuild/protobuf'
import { toBase64 } from '@cosmjs/encoding'
import {
  Keypair,
  StakeProgram,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import { Chain } from '@vultisig/core-chain/Chain'
import { CosmosMsgType } from '@vultisig/core-chain/chains/cosmos/cosmosMsgTypes'
import {
  CosmosSpecificSchema,
  THORChainSpecificSchema,
  TransactionType,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { TronTransferContractPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/tron_contract_payload_pb'
import {
  SignDirectSchema,
  SignSolanaSchema,
  WasmExecuteContractPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { MsgDelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { describe, expect, it } from 'vitest'

import { decodeSignedTransaction } from './decodeSignedTransaction'

const payload = (
  chain: Chain,
  input: Partial<KeysignPayload> = {}
): KeysignPayload => {
  const result = create(KeysignPayloadSchema, {
    coin: create(CoinSchema, {
      chain,
      ticker: chain === Chain.Tron ? 'TRX' : 'RUNE',
      address: 'sender',
      decimals: 8,
      isNativeToken: true,
    }),
    toAddress: 'destination',
    toAmount: '4200000000',
  })
  return Object.assign(result, input)
}

describe('decodeSignedTransaction', () => {
  it('keeps an ordinary transfer unreadable instead of guessing', () => {
    expect(decodeSignedTransaction(payload(Chain.Bitcoin))).toEqual({
      operation: 'unknown',
      amount: { kind: 'unstated' },
      evidence: 'unread',
    })
  })

  it.each([
    ['FREEZE:BANDWIDTH', 'stake'],
    ['FREEZE:ENERGY', 'stake'],
    ['UNFREEZE:BANDWIDTH', 'unstake'],
    ['UNFREEZE:ENERGY', 'unstake'],
  ] as const)('decodes the exact TRON staking marker %s', (memo, operation) => {
    expect(
      decodeSignedTransaction(payload(Chain.Tron, { memo }))
    ).toMatchObject({
      operation,
      amount: { kind: 'units', raw: 4200000000n, asset: 'chainNative' },
      evidence: 'memo',
    })
  })

  it('lets a typed TRON contract outrank a staking-looking sidecar memo', () => {
    const result = decodeSignedTransaction(
      payload(Chain.Tron, {
        memo: 'FREEZE:ENERGY',
        contractPayload: {
          case: 'tronTransferContractPayload',
          value: create(TronTransferContractPayloadSchema, {
            ownerAddress: 'sender',
            toAddress: 'destination',
            amount: '42',
          }),
        },
      })
    )

    expect(result.operation).toBe('unknown')
  })

  it('decodes exact TON nominator-pool comments and hides the withdraw fee', () => {
    expect(
      decodeSignedTransaction(payload(Chain.Ton, { memo: 'Deposit' }))
    ).toMatchObject({
      operation: 'stake',
      amount: { kind: 'units', asset: 'chainNative' },
    })
    expect(
      decodeSignedTransaction(
        payload(Chain.Ton, { memo: 'Withdraw', toAmount: '200000000' })
      )
    ).toMatchObject({ operation: 'unstake', amount: { kind: 'unstated' } })
    expect(
      decodeSignedTransaction(payload(Chain.Ton, { memo: ' Withdraw ' }))
        .operation
    ).toBe('unknown')
  })

  it('decodes native THORChain pool and node memos', () => {
    expect(
      decodeSignedTransaction(
        payload(Chain.THORChain, { memo: '+:BTC.BTC:bc1paired' })
      )
    ).toMatchObject({
      operation: 'addLiquidity',
      counterparty: 'BTC.BTC',
      amount: { kind: 'units', raw: 4200000000n },
    })
    expect(
      decodeSignedTransaction(
        payload(Chain.THORChain, { memo: '-:BTC.BTC:5000' })
      )
    ).toMatchObject({
      operation: 'removeLiquidity',
      amount: { kind: 'fraction', basisPoints: 5000 },
    })
    expect(
      decodeSignedTransaction(
        payload(Chain.THORChain, { memo: 'UNBOND:thor1node:125' })
      )
    ).toMatchObject({
      operation: 'unbond',
      amount: { kind: 'units', raw: 125n },
      counterparty: 'thor1node',
    })
  })

  it('distinguishes Rujira amount memos from THOR node memos', () => {
    expect(
      decodeSignedTransaction(
        payload(Chain.THORChain, {
          memo: 'bond:thor1rujicontract:125',
        })
      )
    ).toMatchObject({
      operation: 'stake',
      amount: {
        kind: 'units',
        raw: 125n,
        asset: { denom: 'thor1rujicontract' },
      },
      counterparty: 'thor1rujicontract',
    })
    expect(
      decodeSignedTransaction(
        payload(Chain.THORChain, {
          memo: 'withdraw:thor1rujicontract:25',
        })
      ).operation
    ).toBe('unstake')
    expect(
      decodeSignedTransaction(
        payload(Chain.THORChain, {
          memo: 'claim:thor1rujicontract:1',
        })
      ).operation
    ).toBe('claimRewards')
  })

  it('does not apply THORChain memo grammar without signed provenance', () => {
    expect(
      decodeSignedTransaction(
        payload(Chain.Ethereum, { memo: '+:BTC.BTC:bc1paired' })
      ).operation
    ).toBe('unknown')
  })

  it('accepts a foreign-chain THOR memo only after live inbound corroboration', () => {
    const transaction = payload(Chain.Ethereum, {
      memo: '+:ETH.ETH:0xpaired',
      toAddress: '0xAbCdEf',
    })

    expect(decodeSignedTransaction(transaction).operation).toBe('unknown')
    expect(
      decodeSignedTransaction(transaction, {
        thorchainInboundAddresses: [
          { chain: 'ETH', address: '0xabcdef', router: '' },
        ],
      }).operation
    ).toBe('addLiquidity')
  })

  it('decodes MAYAChain memo shapes without applying THOR field positions', () => {
    expect(
      decodeSignedTransaction(
        payload(Chain.MayaChain, { memo: 'POOL-:2500:CACAO' })
      )
    ).toMatchObject({
      operation: 'unstake',
      amount: { kind: 'fraction', basisPoints: 2500 },
    })
    expect(
      decodeSignedTransaction(
        payload(Chain.MayaChain, {
          memo: 'BOND:MAYA.CACAO:100:maya1node',
        })
      )
    ).toMatchObject({ operation: 'bond', counterparty: 'maya1node' })
  })

  it('decodes wasm action and amount from the signed contract payload', () => {
    const result = decodeSignedTransaction(
      payload(Chain.THORChain, {
        toAmount: '999999',
        memo: 'UNBOND:spoofed:999',
        contractPayload: {
          case: 'wasmExecuteContractPayload',
          value: create(WasmExecuteContractPayloadSchema, {
            contractAddress: 'thor1contract',
            executeMsg: JSON.stringify({ bond: {} }),
            coins: [{ denom: 'rune', amount: '1234' }],
          }),
        },
      })
    )

    expect(result).toEqual({
      operation: 'stake',
      amount: {
        kind: 'units',
        raw: 1234n,
        asset: { denom: 'rune' },
      },
      evidence: 'wasmExecuteMsg',
      counterparty: 'thor1contract',
    })
  })

  it('does not apply THOR wasm action vocabulary to another Cosmos chain', () => {
    expect(
      decodeSignedTransaction(
        payload(Chain.Cosmos, {
          contractPayload: {
            case: 'wasmExecuteContractPayload',
            value: create(WasmExecuteContractPayloadSchema, {
              contractAddress: 'cosmos1contract',
              executeMsg: JSON.stringify({ bond: {} }),
            }),
          },
        })
      ).operation
    ).toBe('unknown')
  })

  it('refuses ambiguous wasm actions and exposes only a generic contract call', () => {
    const result = decodeSignedTransaction(
      payload(Chain.THORChain, {
        contractPayload: {
          case: 'wasmExecuteContractPayload',
          value: create(WasmExecuteContractPayloadSchema, {
            contractAddress: 'thor1contract',
            executeMsg: JSON.stringify({ bond: {}, withdraw: {} }),
          }),
        },
      })
    )

    expect(result).toMatchObject({
      operation: 'contractCall',
      amount: { kind: 'unstated' },
      evidence: 'wasmExecuteMsg',
    })
  })

  it('reads a Cosmos delegate from active signed body bytes', () => {
    const delegate = MsgDelegate.encode(
      MsgDelegate.fromPartial({
        delegatorAddress: 'cosmos1sender',
        validatorAddress: 'cosmosvaloper1validator',
        amount: { denom: 'uatom', amount: '7654321' },
      })
    ).finish()
    const bodyBytes = toBase64(
      TxBody.encode(
        TxBody.fromPartial({
          messages: [
            { typeUrl: CosmosMsgType.MSG_DELEGATE_URL, value: delegate },
          ],
        })
      ).finish()
    )

    const result = decodeSignedTransaction(
      payload(Chain.Cosmos, {
        memo: 'SWITCH:spoofed',
        signData: {
          case: 'signDirect',
          value: create(SignDirectSchema, { bodyBytes }),
        },
      })
    )

    expect(result).toEqual({
      operation: 'delegate',
      amount: {
        kind: 'units',
        raw: 7654321n,
        asset: { denom: 'uatom' },
      },
      evidence: 'signedData',
      counterparty: 'cosmosvaloper1validator',
    })
  })

  it('refuses a recognized signed message mixed with an unknown operation', () => {
    const delegate = MsgDelegate.encode(
      MsgDelegate.fromPartial({
        delegatorAddress: 'cosmos1sender',
        validatorAddress: 'cosmosvaloper1validator',
        amount: { denom: 'uatom', amount: '1' },
      })
    ).finish()
    const bodyBytes = toBase64(
      TxBody.encode(
        TxBody.fromPartial({
          messages: [
            { typeUrl: CosmosMsgType.MSG_DELEGATE_URL, value: delegate },
            { typeUrl: '/unknown.MsgDrainAccount', value: new Uint8Array() },
          ],
        })
      ).finish()
    )

    expect(
      decodeSignedTransaction(
        payload(Chain.Cosmos, {
          signData: {
            case: 'signDirect',
            value: create(SignDirectSchema, { bodyBytes }),
          },
        })
      ).operation
    ).toBe('unknown')
  })

  it('keeps a signed Cosmos bank send on the generic transfer fallback', () => {
    const send = MsgSend.encode(
      MsgSend.fromPartial({
        fromAddress: 'cosmos1sender',
        toAddress: 'cosmos1receiver',
        amount: [{ denom: 'uatom', amount: '42' }],
      })
    ).finish()
    const bodyBytes = toBase64(
      TxBody.encode(
        TxBody.fromPartial({
          messages: [{ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: send }],
        })
      ).finish()
    )

    expect(
      decodeSignedTransaction(
        payload(Chain.Cosmos, {
          signData: {
            case: 'signDirect',
            value: create(SignDirectSchema, { bodyBytes }),
          },
        })
      )
    ).toMatchObject({
      operation: 'transfer',
      evidence: 'signedData',
      counterparty: 'cosmos1receiver',
    })
  })

  it('fails closed when opaque signed data is malformed', () => {
    const result = decodeSignedTransaction(
      payload(Chain.Cosmos, {
        memo: 'SWITCH:thor1destination',
        signData: {
          case: 'signDirect',
          value: create(SignDirectSchema, { bodyBytes: 'not base64' }),
        },
      })
    )

    expect(result.operation).toBe('unknown')
  })

  it('decodes a Solana deactivate from the exact relayed transaction bytes', () => {
    const authority = Keypair.generate().publicKey
    const stakeAccount = Keypair.generate().publicKey
    const transaction = new Transaction({
      feePayer: authority,
      recentBlockhash: Keypair.generate().publicKey.toBase58(),
    }).add(
      StakeProgram.deactivate({
        stakePubkey: stakeAccount,
        authorizedPubkey: authority,
      })
    )
    const raw = transaction
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString('base64')

    expect(
      decodeSignedTransaction(
        payload(Chain.Solana, {
          signData: {
            case: 'signSolana',
            value: create(SignSolanaSchema, { rawTransactions: [raw] }),
          },
        })
      )
    ).toMatchObject({
      operation: 'unstake',
      amount: { kind: 'unstated' },
      evidence: 'signedData',
      counterparty: stakeAccount.toBase58(),
    })
  })

  it('refuses a Solana delegation whose signed authorities do not agree', () => {
    const payer = Keypair.generate().publicKey
    const stakeAccount = Keypair.generate().publicKey
    const initializedAuthority = Keypair.generate().publicKey
    const delegatedAuthority = Keypair.generate().publicKey
    const voteAccount = Keypair.generate().publicKey
    const transaction = new Transaction({
      feePayer: payer,
      recentBlockhash: Keypair.generate().publicKey.toBase58(),
    }).add(
      SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: stakeAccount,
        lamports: 1_000_000,
        space: StakeProgram.space,
        programId: StakeProgram.programId,
      }),
      StakeProgram.initialize({
        stakePubkey: stakeAccount,
        authorized: {
          staker: initializedAuthority,
          withdrawer: initializedAuthority,
        },
      }),
      StakeProgram.delegate({
        stakePubkey: stakeAccount,
        authorizedPubkey: delegatedAuthority,
        votePubkey: voteAccount,
      })
    )
    const raw = transaction
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString('base64')

    expect(
      decodeSignedTransaction(
        payload(Chain.Solana, {
          signData: {
            case: 'signSolana',
            value: create(SignSolanaSchema, { rawTransactions: [raw] }),
          },
        })
      ).operation
    ).toBe('unknown')
  })

  it('decodes a fully corroborated Solana delegation sequence', () => {
    const authority = Keypair.generate().publicKey
    const stakeAccount = Keypair.generate().publicKey
    const voteAccount = Keypair.generate().publicKey
    const transaction = new Transaction({
      feePayer: authority,
      recentBlockhash: Keypair.generate().publicKey.toBase58(),
    }).add(
      SystemProgram.createAccount({
        fromPubkey: authority,
        newAccountPubkey: stakeAccount,
        lamports: 1_000_000,
        space: StakeProgram.space,
        programId: StakeProgram.programId,
      }),
      StakeProgram.initialize({
        stakePubkey: stakeAccount,
        authorized: { staker: authority, withdrawer: authority },
      }),
      StakeProgram.delegate({
        stakePubkey: stakeAccount,
        authorizedPubkey: authority,
        votePubkey: voteAccount,
      })
    )
    const raw = transaction
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString('base64')

    expect(
      decodeSignedTransaction(
        payload(Chain.Solana, {
          signData: {
            case: 'signSolana',
            value: create(SignSolanaSchema, { rawTransactions: [raw] }),
          },
        })
      )
    ).toMatchObject({
      operation: 'delegate',
      amount: { kind: 'accountFunding', raw: 1_000_000n },
      counterparty: voteAccount.toBase58(),
    })
  })

  it('decodes corroborating wire transaction types', () => {
    expect(
      decodeSignedTransaction(
        payload(Chain.Cosmos, {
          blockchainSpecific: {
            case: 'cosmosSpecific',
            value: create(CosmosSpecificSchema, {
              transactionType: TransactionType.IBC_TRANSFER,
            }),
          },
        })
      ).operation
    ).toBe('ibcTransfer')

    expect(
      decodeSignedTransaction(
        payload(Chain.THORChain, {
          blockchainSpecific: {
            case: 'thorchainSpecific',
            value: create(THORChainSpecificSchema, {
              transactionType: TransactionType.THOR_UNMERGE,
            }),
          },
        })
      )
    ).toMatchObject({
      operation: 'unmerge',
      amount: { kind: 'unstated' },
      evidence: 'wireTransactionType',
    })
  })
})
