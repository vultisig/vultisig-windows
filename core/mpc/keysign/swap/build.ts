import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { isChainOfKind } from '@core/chain/ChainKind'
import { getErc20Allowance } from '@core/chain/chains/evm/erc20/getErc20Allowance'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { GeneralSwapTx } from '@core/chain/swap/general/GeneralSwapQuote'
import { getSwapDestinationAddress } from '@core/chain/swap/keysign/getSwapDestinationAddress'
import { nativeSwapQuoteToSwapPayload } from '@core/chain/swap/native/utils/nativeSwapQuoteToSwapPayload'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { getBlockchainSpecificValue } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { refineKeysignUtxo } from '@core/mpc/keysign/refine/utxo'
import { CommKeysignSwapPayload } from '@core/mpc/keysign/swap/KeysignSwapPayload'
import { getKeysignUtxoInfo } from '@core/mpc/keysign/utxo/getKeysignUtxoInfo'
import { MpcLib } from '@core/mpc/mpcLib'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import {
  OneInchQuoteSchema,
  OneInchSwapPayloadSchema,
  OneInchTransaction,
  OneInchTransactionSchema,
} from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { Erc20ApprovePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/erc20_approve_payload_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

export type BuildSwapKeysignPayloadInput = {
  fromCoin: AccountCoin
  toCoin: AccountCoin
  amount: number
  swapQuote: SwapQuote
  vaultId: string
  localPartyId: string
  fromPublicKey: PublicKey
  toPublicKey: PublicKey
  libType: MpcLib
  walletCore: WalletCore
}

export const buildSwapKeysignPayload = async ({
  fromCoin,
  toCoin,
  amount,
  swapQuote,
  vaultId,
  localPartyId,
  fromPublicKey,
  toPublicKey,
  libType,
  walletCore,
}: BuildSwapKeysignPayloadInput) => {
  const chainAmount = toChainAmount(amount, fromCoin.decimals)

  const fromCoinHexPublicKey = Buffer.from(fromPublicKey.data()).toString('hex')
  const toCoinHexPublicKey = Buffer.from(toPublicKey.data()).toString('hex')

  const thirdPartyGasLimitEstimation = matchRecordUnion<
    SwapQuote,
    bigint | undefined
  >(swapQuote, {
    native: () => undefined,
    general: ({ tx }) =>
      matchRecordUnion<GeneralSwapTx, bigint | undefined>(tx, {
        evm: ({ gasLimit }) => gasLimit,
        solana: () => undefined,
      }),
  })

  let keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...fromCoin,
      hexPublicKey: fromCoinHexPublicKey,
    }),
    toAmount: chainAmount.toString(),
    vaultLocalPartyId: localPartyId,
    vaultPublicKeyEcdsa: vaultId,
    libType,
    toAddress: getSwapDestinationAddress({ quote: swapQuote, fromCoin }),
    utxoInfo: await getKeysignUtxoInfo(fromCoin),
    memo: matchRecordUnion<SwapQuote, string | undefined>(swapQuote, {
      native: ({ memo }) => memo,
      general: () => undefined,
    }),
  })

  keysignPayload.swapPayload = matchRecordUnion<
    SwapQuote,
    KeysignPayload['swapPayload']
  >(swapQuote, {
    general: quote => {
      const txMsg = matchRecordUnion<
        GeneralSwapTx,
        Omit<OneInchTransaction, '$typeName' | 'swapFee'>
      >(quote.tx, {
        evm: ({ from, to, data, value }) => {
          return {
            from,
            to,
            data,
            value,
            gasPrice: '',
            gas: 0n,
          }
        },
        solana: ({ data }) => ({
          from: '',
          to: '',
          data,
          value: '',
          gasPrice: '',
          gas: BigInt(0),
        }),
      })

      const tx = create(OneInchTransactionSchema, txMsg)

      const swapPayload: CommKeysignSwapPayload = {
        case: 'oneinchSwapPayload',
        value: create(OneInchSwapPayloadSchema, {
          fromCoin: toCommCoin({
            ...fromCoin,
            hexPublicKey: fromCoinHexPublicKey,
          }),
          toCoin: toCommCoin({
            ...toCoin,
            hexPublicKey: toCoinHexPublicKey,
          }),
          fromAmount: chainAmount.toString(),
          toAmountDecimal: fromChainAmount(
            quote.dstAmount,
            toCoin.decimals
          ).toFixed(toCoin.decimals),
          quote: create(OneInchQuoteSchema, {
            dstAmount: quote.dstAmount,
            tx,
          }),
          provider: quote.provider,
        }),
      }

      return swapPayload
    },
    native: quote => {
      return nativeSwapQuoteToSwapPayload({
        quote,
        fromCoin: {
          ...fromCoin,
          hexPublicKey: fromCoinHexPublicKey,
        },
        amount: chainAmount,
        toCoin: {
          ...toCoin,
          hexPublicKey: toCoinHexPublicKey,
        },
      })
    },
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    walletCore,
    thirdPartyGasLimitEstimation,
    isDeposit: matchRecordUnion<SwapQuote, boolean>(swapQuote, {
      native: ({ swapChain }) =>
        areEqualCoins(fromCoin, chainFeeCoin[swapChain]),
      general: () => false,
    }),
  })

  const { chain } = fromCoin

  if (
    isChainOfKind(chain, 'evm') &&
    keysignPayload.swapPayload?.case === 'oneinchSwapPayload' &&
    keysignPayload.swapPayload.value.quote?.tx
  ) {
    // It doesn't make sense, as this data is already set in a chain-specific manner, and we will ignore those fields.
    // However, other platforms still expect these fields to be populated.
    const { maxFeePerGasWei, gasLimit } = getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'ethereumSpecific'
    )
    keysignPayload.swapPayload.value.quote.tx.gasPrice = maxFeePerGasWei
    keysignPayload.swapPayload.value.quote.tx.gas = BigInt(gasLimit)
  }

  if (isChainOfKind(chain, 'evm') && fromCoin.id) {
    const spender = keysignPayload.toAddress
    const allowance = await getErc20Allowance({
      chain,
      id: fromCoin.id,
      address: fromCoin.address,
      spender,
    })

    if (allowance < chainAmount) {
      keysignPayload.erc20ApprovePayload = create(Erc20ApprovePayloadSchema, {
        amount: chainAmount.toString(),
        spender,
      })
    }
  }

  if (isChainOfKind(fromCoin.chain, 'utxo')) {
    keysignPayload = refineKeysignUtxo({
      keysignPayload,
      walletCore,
      publicKey: fromPublicKey,
    })
  }

  return keysignPayload
}
