import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { getChainSpecific } from '@vultisig/core-mpc/keysign/chainSpecific'
import { getRippleSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs/resolvers/ripple'
import { getTronSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs/resolvers/tron'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { RippleTransaction } from '../core/ripple/sanitizeRippleDappTx'
import { TransactionDetails, TronMsgType } from '../interfaces'
import { buildSendTxKeysignPayload } from './build'

vi.mock('@vultisig/core-mpc/keysign/chainSpecific', () => ({
  getChainSpecific: vi.fn(async ({ keysignPayload }) => {
    if (keysignPayload.coin?.chain === Chain.Ripple) {
      return {
        case: 'rippleSpecific',
        value: {
          gas: 12n,
          sequence: 10n,
          lastLedgerSequence: 20n,
        },
      }
    }

    if (keysignPayload.coin?.chain === Chain.Tron) {
      return {
        case: 'tronSpecific',
        value: {
          timestamp: 1_700_000_000_000n,
          expiration: 1_700_000_060_000n,
          blockHeaderTimestamp: 1_700_000_000_000n,
          blockHeaderNumber: 1n,
          blockHeaderVersion: 30n,
          blockHeaderTxTrieRoot: '',
          blockHeaderParentHash: '',
          blockHeaderWitnessAddress: '',
          gasEstimation: 100_000_000n,
        },
      }
    }

    return undefined
  }),
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

const tronVaultAddress = 'TBXSw8fM4jpQkGc6zZjsVABFpVN7UvXPdV'
const tronRecipientHex = '22'.repeat(20)
const tronRecipient = 'TD5gsCwxykWsLN9aPrq2TAfNjByuZKYp4E'
const usdtAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
const trxCoin: AccountCoin = {
  ...chainFeeCoin[Chain.Tron],
  address: tronVaultAddress,
}
const usdtCoin: AccountCoin = {
  chain: Chain.Tron,
  id: usdtAddress,
  ticker: 'USDT',
  decimals: 6,
  address: tronVaultAddress,
}
const tronMeta = {
  timestamp: 1_700_000_000_000,
  expiration: 1_700_000_060_000,
  refBlockBytesHex: '0001',
  refBlockHashHex: '0102030405060708',
}
const abiWord = (hex: string) => hex.padStart(64, '0')
const trc20TransferData = `a9059cbb${abiWord(tronRecipientHex)}${abiWord((1_000_000).toString(16))}`
const trc20ApproveData = `095ea7b3${abiWord(tronRecipientHex)}${'f'.repeat(64)}`

type TronDappCase = {
  name: string
  coin: AccountCoin
  transactionDetails: TransactionDetails
}

// The reviewed fields as the extension's TronWeb provider fills them from
// the contract it is asked to sign.
const tronDappCases: TronDappCase[] = [
  {
    name: 'TRX transfer',
    coin: trxCoin,
    transactionDetails: {
      asset: { ticker: 'TRX' },
      from: tronVaultAddress,
      to: tronRecipient,
      amount: { amount: '1', decimals: 6 },
      msgPayload: {
        case: TronMsgType.TRON_TRANSFER_CONTRACT,
        value: {
          owner_address: tronVaultAddress,
          to_address: tronRecipient,
          amount: 1,
        },
        meta: tronMeta,
      },
      skipBroadcast: true,
    },
  },
  {
    name: 'TRC-20 transfer',
    coin: usdtCoin,
    transactionDetails: {
      asset: { ticker: 'USDT', contractAddress: usdtAddress },
      from: tronVaultAddress,
      to: tronRecipient,
      amount: { amount: '1000000', decimals: 6 },
      msgPayload: {
        case: TronMsgType.TRON_TRIGGER_SMART_CONTRACT,
        value: {
          owner_address: tronVaultAddress,
          contract_address: usdtAddress,
          data: trc20TransferData,
        },
        meta: tronMeta,
      },
      skipBroadcast: true,
    },
  },
  {
    name: 'TRC-20 approve',
    coin: trxCoin,
    transactionDetails: {
      asset: { ticker: 'TRX' },
      from: tronVaultAddress,
      to: usdtAddress,
      amount: { amount: '0', decimals: 6 },
      msgPayload: {
        case: TronMsgType.TRON_TRIGGER_SMART_CONTRACT,
        value: {
          owner_address: tronVaultAddress,
          contract_address: usdtAddress,
          data: trc20ApproveData,
        },
        meta: tronMeta,
      },
      skipBroadcast: true,
    },
  },
  {
    name: 'payable contract call',
    coin: trxCoin,
    transactionDetails: {
      asset: { ticker: 'TRX' },
      from: tronVaultAddress,
      to: usdtAddress,
      amount: { amount: '5', decimals: 6 },
      msgPayload: {
        case: TronMsgType.TRON_TRIGGER_SMART_CONTRACT,
        value: {
          owner_address: tronVaultAddress,
          contract_address: usdtAddress,
          call_value: 5,
          data: trc20ApproveData,
        },
        meta: tronMeta,
      },
      skipBroadcast: true,
    },
  },
]

const buildTronDappPayload = ({
  coin,
  transactionDetails,
}: Omit<TronDappCase, 'name'>) =>
  buildSendTxKeysignPayload({
    parsedTx: {
      coin,
      customTxData: {
        regular: {
          chain: Chain.Tron,
          coin,
          transactionDetails,
          isEvmContractCall: false,
        },
      },
      skipBroadcast: true,
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
  it.each([undefined, 1_800_000_060])(
    'preserves TonConnect messages and forwards deadline %s',
    async validUntil => {
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
                validUntil,
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
      expect(getChainSpecific).toHaveBeenLastCalledWith(
        expect.objectContaining({ validUntil })
      )
    }
  )
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

  it.each(tronDappCases)(
    'keeps a TRON dApp $name signable',
    async ({ coin, transactionDetails }) => {
      const payload = await buildTronDappPayload({ coin, transactionDetails })

      expect(
        getTronSigningInputs({ keysignPayload: payload, walletCore })
      ).toHaveLength(1)
    }
  )

  it('refuses a TRON dApp payload whose reviewed recipient was changed', async () => {
    const [, trc20Transfer] = tronDappCases
    const payload = await buildTronDappPayload(trc20Transfer)
    payload.toAddress = tronVaultAddress

    expect(() =>
      getTronSigningInputs({ keysignPayload: payload, walletCore })
    ).toThrow(/recipient/)
  })
})
