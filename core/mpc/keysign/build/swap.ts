import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { EvmChain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { getErc20Allowance } from '@core/chain/chains/evm/erc20/getErc20Allowance'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { FeeSettings } from '@core/chain/feeQuote/settings/core'
import { GeneralSwapTx } from '@core/chain/swap/general/GeneralSwapQuote'
import { getSwapKeysignPayloadFields } from '@core/chain/swap/keysign/getSwapKeysignPayloadFields'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { refineKeysignUtxo } from '@core/mpc/keysign/refine/utxo'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { Erc20ApprovePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/erc20_approve_payload_pb'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { MpcLib } from '../../mpcLib'
import { getKeysignUtxoInfo } from '../utxo/getKeysignUtxoInfo'

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
  feeSettings?: FeeSettings
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
  feeSettings,
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
    utxoInfo: await getKeysignUtxoInfo(fromCoin),
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    feeSettings,
    thirdPartyGasLimitEstimation,
  })

  const swapSpecificFields = getSwapKeysignPayloadFields({
    amount: chainAmount,
    quote: swapQuote,
    fromCoin: {
      ...fromCoin,
      hexPublicKey: fromCoinHexPublicKey,
    },
    toCoin: {
      ...toCoin,
      hexPublicKey: toCoinHexPublicKey,
    },
    chainSpecific: keysignPayload.blockchainSpecific,
  })

  keysignPayload = {
    ...keysignPayload,
    ...swapSpecificFields,
  }

  const isErc20 =
    isOneOf(fromCoin.chain, Object.values(EvmChain)) && !isFeeCoin(fromCoin)

  if (isErc20 && fromCoin.id) {
    const spender = swapSpecificFields.toAddress
    const allowance = await getErc20Allowance({
      chain: fromCoin.chain as EvmChain,
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
