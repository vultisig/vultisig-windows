import { getInsufficientFundsMessage } from '@core/ui/vault/send/funds/getInsufficientFundsMessage'
import { WalletCore } from '@trustwallet/wallet-core'
import { Chain, UtxoBasedChain } from '@vultisig/core-chain/Chain'
import { validateUtxoRequirements } from '@vultisig/core-chain/chains/utxo/send/validateUtxoRequirements'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import {
  getChainDangerousReason,
  getEvmDangerousReason,
} from '@vultisig/core-chain/security/dangerousAddresses'
import { isValidRecipient } from '@vultisig/core-chain/utils/isValidRecipient'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'
import { TFunction } from 'i18next'

import { getSendDestinationTag } from '../state/destinationTag'
import { SendFormShape, ValidationResult } from './formShape'
import { getReceiverAddressFormatHint } from './getReceiverAddressFormatHint'

type ValidateSendReceiverInput = {
  receiverAddress: string
  chain: Chain
  senderAddress: string
  walletCore: WalletCore
  t: TFunction
}

export const validateSendReceiver = ({
  receiverAddress,
  chain,
  senderAddress,
  walletCore,
  t,
}: ValidateSendReceiverInput): string | undefined => {
  if (!receiverAddress) {
    return t('enter_address')
  }

  if (
    chain === Chain.Tron &&
    areLowerCaseEqual(senderAddress, receiverAddress)
  ) {
    return t('send_receiver_address_same_as_sender')
  }

  // Known burn / program destinations are named before format validation:
  // some of them (the Solana Incinerator is off-curve) would otherwise fail
  // the wallet-recipient check and surface as a generic format error. The SDK
  // refuses to build the keysign payload for these too, but by then the user
  // is on the Continue button; naming it here keeps the reason next to the
  // field that needs fixing. Same lists the SDK uses: EVM by shape, the rest
  // keyed by chain.
  const dangerousReason =
    getEvmDangerousReason(receiverAddress) ??
    getChainDangerousReason(chain, receiverAddress)

  if (dangerousReason) {
    return t('send_receiver_dangerous_address', { reason: dangerousReason })
  }

  if (!isValidRecipient({ address: receiverAddress, chain, walletCore })) {
    return t('send_invalid_receiver_address_with_hint', {
      error: t('send_invalid_receiver_address'),
      hint: getReceiverAddressFormatHint({ chain, senderAddress, t }),
    })
  }
}

type GetSendFundsErrorInput = {
  coin: SendFormShape['coin']
  amount: bigint
  balance: bigint
  fee?: bigint
  nativeBalance?: bigint
  isFeePaidInCoin: boolean
  t: TFunction
}

const getSendFundsError = ({
  coin,
  amount,
  balance,
  fee,
  nativeBalance,
  isFeePaidInCoin,
  t,
}: GetSendFundsErrorInput): string | undefined => {
  if (
    !isFeePaidInCoin &&
    nativeBalance != null &&
    fee != null &&
    nativeBalance < fee
  ) {
    const { ticker, decimals } = chainFeeCoin[coin.chain]
    return getInsufficientFundsMessage(
      {
        required: fee,
        available: nativeBalance,
        ticker,
        decimals,
        includesNetworkCosts: true,
      },
      t
    )
  }

  const { ticker, decimals } = coin
  if (isFeePaidInCoin && fee != null) {
    if (amount + fee <= balance) return undefined
    return getInsufficientFundsMessage(
      {
        required: amount + fee,
        available: balance,
        ticker,
        decimals,
        includesNetworkCosts: true,
      },
      t
    )
  }

  if (amount <= balance) return undefined
  return getInsufficientFundsMessage(
    {
      required: amount,
      available: balance,
      ticker,
      decimals,
      includesNetworkCosts: false,
    },
    t
  )
}

export const validateSendForm = (
  values: SendFormShape,
  helpers: {
    balance: bigint
    walletCore: WalletCore
    t: TFunction
    fee?: bigint
    nativeBalance?: bigint
    /**
     * Whether `fee` is charged in the coin being sent rather than the chain's
     * native coin. True for a native send; also for a gasless TON jetton send.
     * Defaults to whether the coin is the chain's fee coin.
     */
    isFeePaidInCoin?: boolean
  }
): ValidationResult<SendFormShape> => {
  const {
    coin,
    amount,
    destinationTag = '',
    senderAddress,
    receiverAddress,
  } = values
  const {
    balance,
    walletCore,
    t,
    fee,
    nativeBalance,
    isFeePaidInCoin = isFeeCoin(coin),
  } = helpers
  const { chain } = coin
  const errors: ValidationResult<SendFormShape> = {}

  if (!coin) errors.coin = t('required_field_missing')

  if (!amount) {
    errors.amount = t('amount_required')
  } else {
    const fundsError = getSendFundsError({
      coin,
      amount,
      balance,
      fee,
      nativeBalance,
      isFeePaidInCoin,
      t,
    })
    if (fundsError) {
      errors.amount = fundsError
    }

    if (isOneOf(chain, Object.values(UtxoBasedChain)) && amount) {
      const errorMsg = validateUtxoRequirements({
        amount,
        balance,
        chain,
        fee: isFeeCoin(coin) ? fee : undefined,
        skipDustCheck:
          chain === Chain.Cardano && isFeeCoin(coin) && fee == null,
      })

      if (errorMsg) {
        errors.amount = errorMsg
      }
    }
  }

  const receiverError = validateSendReceiver({
    receiverAddress,
    chain,
    senderAddress,
    walletCore,
    t,
  })

  if (receiverError) {
    errors.receiverAddress = receiverError
  }

  if (
    getSendDestinationTag({
      chain,
      receiver: receiverAddress,
      value: destinationTag,
    }).error
  ) {
    errors.destinationTag = t('ripple_destination_tag_invalid')
  }

  return errors
}
