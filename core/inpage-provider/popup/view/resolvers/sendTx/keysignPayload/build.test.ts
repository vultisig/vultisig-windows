import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { getRippleSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs/resolvers/ripple'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { RippleTransaction } from '../core/ripple/sanitizeRippleDappTx'
import { buildSendTxKeysignPayload } from './build'

vi.mock('@vultisig/core-mpc/keysign/chainSpecific', () => ({
  getChainSpecific: vi.fn(async ({ keysignPayload }) =>
    keysignPayload.coin?.chain === Chain.Ripple
      ? {
          case: 'rippleSpecific',
          value: {
            gas: 12n,
            sequence: 10n,
            lastLedgerSequence: 20n,
          },
        }
      : undefined
  ),
}))

const solanaCoin: AccountCoin = {
  chain: Chain.Solana,
  id: 'SOL',
  address: 'solana-wallet-address',
  decimals: 9,
  ticker: 'SOL',
}

const tonCoin: AccountCoin = {
  chain: Chain.Ton,
  address: 'UQCc9iCgP_b5RMJcFE5XD8zStfjtNHLhDWfUqC5m1SjSer95',
  decimals: 9,
  ticker: 'GRAM',
}

let walletCore: WalletCore
let publicKey: PublicKey

beforeAll(async () => {
  walletCore = await initWasm()
  const privateKey = walletCore.PrivateKey.createWithData(
    new Uint8Array(32).fill(1)
  )
  publicKey = privateKey.getPublicKeySecp256k1(true)
  privateKey.delete()
})

afterAll(() => publicKey?.delete())

const rippleAccount = 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY'
const rippleDestination = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'
const rippleCoin: AccountCoin = {
  ...chainFeeCoin[Chain.Ripple],
  address: rippleAccount,
}

type BuildRipplePayloadInput = {
  transaction: RippleTransaction
  skipBroadcast?: boolean
}

const buildRipplePayload = ({
  transaction,
  skipBroadcast = false,
}: BuildRipplePayloadInput) =>
  buildSendTxKeysignPayload({
    parsedTx: {
      coin: rippleCoin,
      customTxData: { ripple: { transaction } },
      skipBroadcast,
    },
    publicKey,
    walletCore,
    vaultId: 'vault-id',
    localPartyId: 'local-party',
  })

describe('buildSendTxKeysignPayload', () => {
  it('preserves every raw Solana transaction in the signing payload', async () => {
    const rawTransactions = ['first-transaction', 'second-transaction']

    const payload = await buildSendTxKeysignPayload({
      parsedTx: {
        coin: solanaCoin,
        customTxData: {
          solana: {
            raw: {
              inputCoin: solanaCoin,
              inAmount: '0',
              transactions: rawTransactions,
            },
          },
        },
      },
      publicKey,
      walletCore,
      vaultId: 'vault-id',
      localPartyId: 'local-party',
    })

    expect(payload.signData).toMatchObject({
      case: 'signSolana',
      value: {
        rawTransactions,
      },
    })
  })

  // A TonConnect message may deploy a contract: its `stateInit` is the code the
  // destination does not have yet. Dropping it here signs a plain transfer to an
  // address with no code, so every message must reach the signer with its own.
  it('keeps each TonConnect message stateInit in the signTon payload', async () => {
    const deployMessage = {
      to: 'EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC',
      amount: '50000000',
      payload: 'te6cckEBAQEABgAACAAAAA==',
      stateInit: 'te6cckEBAQEAJAAAQ4ABase64EncodedStateInit',
    }
    const plainMessage = {
      to: 'EQDmLe6ticcY_uLZsfurdYONshNuCn8IS81KcJ8p6M6ISJrE',
      amount: '50000000',
    }

    const payload = await buildSendTxKeysignPayload({
      parsedTx: {
        coin: tonCoin,
        customTxData: {
          regular: {
            chain: Chain.Ton,
            coin: tonCoin,
            transactionDetails: {
              from: tonCoin.address,
              to: deployMessage.to,
              asset: { ticker: tonCoin.ticker },
              amount: {
                amount: deployMessage.amount,
                decimals: tonCoin.decimals,
              },
              data: deployMessage.payload,
              tonMessages: [deployMessage, plainMessage],
            },
          },
        },
      },
      publicKey,
      walletCore,
      vaultId: 'vault-id',
      localPartyId: 'local-party',
    })

    expect(payload.signData).toMatchObject({
      case: 'signTon',
      value: { tonMessages: [deployMessage, plainMessage] },
    })

    const [, secondMessage] =
      payload.signData.case === 'signTon'
        ? payload.signData.value.tonMessages
        : []

    expect(secondMessage?.stateInit).toBeUndefined()
  })
  it.each([false, true])(
    'binds a native XRPL Payment amount with skipBroadcast=%s',
    async skipBroadcast => {
      const amount = '1'
      const payload = await buildRipplePayload({
        transaction: {
          TransactionType: 'Payment',
          Account: rippleAccount,
          Destination: rippleDestination,
          Amount: amount,
        },
        skipBroadcast,
      })

      expect(payload).toMatchObject({
        toAddress: rippleDestination,
        toAmount: amount,
        skipBroadcast,
        signData: { case: 'signRipple' },
      })

      const [signingInput] = await getRippleSigningInputs({
        keysignPayload: payload,
        walletCore,
      })

      expect(signingInput.rawJson).toBe(
        payload.signData.case === 'signRipple'
          ? payload.signData.value.rawJson
          : undefined
      )
    }
  )

  it.each([
    {
      type: 'OfferCreate',
      fields: {
        TakerGets: '1000000',
        TakerPays: {
          currency: 'USD',
          issuer: rippleDestination,
          value: '1',
        },
      },
    },
    { type: 'OfferCancel', fields: { OfferSequence: 7 } },
    {
      type: 'TrustSet',
      fields: {
        LimitAmount: {
          currency: 'USD',
          issuer: rippleDestination,
          value: '10',
        },
      },
    },
  ])(
    'keeps XRPL $type signable without a reviewed scalar',
    async ({ type, fields }) => {
      const payload = await buildRipplePayload({
        transaction: {
          TransactionType: type,
          Account: rippleAccount,
          ...fields,
        },
      })

      expect(payload.toAmount).toBe('0')
      expect(
        getRippleSigningInputs({
          keysignPayload: payload,
          walletCore,
        })
      ).toHaveLength(1)
    }
  )
})
