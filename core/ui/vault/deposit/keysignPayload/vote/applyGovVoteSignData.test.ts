import { create } from '@bufbuild/protobuf'
import { fromBase64 } from '@cosmjs/encoding'
import { initWasm, TW, type WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { getEncodedSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs'
import { toCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import {
  CosmosSpecificSchema,
  TransactionType,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1beta1/tx'
import { AuthInfo, SignDoc, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { beforeAll, describe, expect, it } from 'vitest'

import { applyGovVoteSignData } from './applyGovVoteSignData'

const accountNumber = 123456n
const sequence = 11n
const dydxFee = 2500000000000000n

describe('applyGovVoteSignData', () => {
  let walletCore: WalletCore
  let publicKey: PublicKey
  let coin: AccountCoin

  beforeAll(async () => {
    walletCore = await initWasm()
    publicKey = walletCore.PrivateKey.createWithData(
      new Uint8Array(32).fill(7)
    ).getPublicKeySecp256k1(true)
    coin = {
      chain: Chain.Dydx,
      ticker: 'DYDX',
      decimals: 18,
      address: walletCore.AnyAddress.createWithPublicKey(
        publicKey,
        walletCore.CoinType.dydx
      ).description(),
    }
  })

  const buildPayload = (gasLimit?: bigint) =>
    create(KeysignPayloadSchema, {
      coin: toCommCoin({
        ...coin,
        hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
      }),
      memo: '',
      toAmount: '0',
      blockchainSpecific: {
        case: 'cosmosSpecific',
        value: create(CosmosSpecificSchema, {
          accountNumber,
          sequence,
          gas: dydxFee,
          gasLimit,
        }),
      },
    })

  const vote = (option: unknown, gasLimit?: bigint) =>
    applyGovVoteSignData({
      coin,
      depositData: { proposalId: '398', option },
      publicKey,
      keysignPayload: buildPayload(gasLimit),
    })

  const getSignDirect = (option: unknown, gasLimit?: bigint) => {
    const payload = vote(option, gasLimit)
    if (payload.signData.case !== 'signDirect') {
      throw new Error(`expected signDirect, got ${payload.signData.case}`)
    }
    return { payload, signDirect: payload.signData.value }
  }

  it.each([
    ['yes', VoteOption.VOTE_OPTION_YES],
    ['abstain', VoteOption.VOTE_OPTION_ABSTAIN],
    ['no', VoteOption.VOTE_OPTION_NO],
    ['noWithVeto', VoteOption.VOTE_OPTION_NO_WITH_VETO],
  ])('carries a %s vote as a single MsgVote with no memo', (option, proto) => {
    const { signDirect } = getSignDirect(option)
    const body = TxBody.decode(fromBase64(signDirect.bodyBytes))

    expect(body.memo).toBe('')
    expect(body.messages).toHaveLength(1)
    expect(body.messages[0].typeUrl).toBe('/cosmos.gov.v1beta1.MsgVote')

    const msg = MsgVote.decode(body.messages[0].value)
    expect(msg.proposalId).toBe(398n)
    expect(msg.voter).toBe(coin.address)
    expect(msg.option).toBe(proto)
  })

  it('signs the chain fee at the static gas limit, with the payload sequence', () => {
    const { signDirect } = getSignDirect('yes')
    const authInfo = AuthInfo.decode(fromBase64(signDirect.authInfoBytes))

    expect(authInfo.fee?.amount).toEqual([
      { denom: 'adydx', amount: dydxFee.toString() },
    ])
    expect(authInfo.fee?.gasLimit).toBe(200000n)
    expect(authInfo.signerInfos[0].sequence).toBe(sequence)
  })

  it('honours a relayed gas limit', () => {
    const { signDirect } = getSignDirect('yes', 300000n)
    const authInfo = AuthInfo.decode(fromBase64(signDirect.authInfoBytes))

    expect(authInfo.fee?.gasLimit).toBe(300000n)
  })

  // iOS DydxHelperStruct only reads signData on a non-VOTE payload, and
  // rejects one whose toAddress is not a dYdX address.
  it('keeps the payload a plain signDirect tx iOS will co-sign', () => {
    const { payload, signDirect } = getSignDirect('no')

    expect(payload.memo).toBe('')
    expect(payload.toAddress).toBe(coin.address)
    expect(payload.toAmount).toBe('0')
    expect(signDirect.chainId).toBe('dydx-mainnet-1')
    expect(
      payload.blockchainSpecific.case === 'cosmosSpecific' &&
        payload.blockchainSpecific.value.transactionType
    ).toBe(TransactionType.UNSPECIFIED)
  })

  it('is signed by the SDK as exactly these bytes', async () => {
    const { payload, signDirect } = getSignDirect('noWithVeto')
    const [input] = await getEncodedSigningInputs({
      keysignPayload: payload,
      walletCore,
    })
    const preSigningOutput = TW.TxCompiler.Proto.PreSigningOutput.decode(
      walletCore.TransactionCompiler.preImageHashes(
        walletCore.CoinType.dydx,
        input
      )
    )

    expect(preSigningOutput.errorMessage).toBe('')
    expect(Buffer.from(preSigningOutput.data)).toEqual(
      Buffer.from(
        SignDoc.encode({
          bodyBytes: fromBase64(signDirect.bodyBytes),
          authInfoBytes: fromBase64(signDirect.authInfoBytes),
          chainId: 'dydx-mainnet-1',
          accountNumber,
        }).finish()
      )
    )
  })

  it('refuses a vote without a valid ballot', () => {
    expect(() => vote(true)).toThrow(/Invalid governance vote option/)
  })
})
