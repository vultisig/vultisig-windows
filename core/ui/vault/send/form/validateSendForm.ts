import { Chain, UtxoBasedChain } from '@core/chain/Chain'
import { validateUtxoRequirements } from '@core/chain/chains/utxo/send/validateUtxoRequirements'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { WalletCore } from '@trustwallet/wallet-core'
import { TFunction } from 'i18next'

import { SendFormShape, ValidationResult } from './formShape'

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
    return t('send_invalid_receiver_address')
  }

  if (
    chain === Chain.Tron &&
    areLowerCaseEqual(senderAddress, receiverAddress)
  ) {
    return t('send_receiver_address_same_as_sender')
  }

  if (!isValidAddress({ address: receiverAddress, chain, walletCore })) {
    return t('send_invalid_receiver_address')
  }
}

export const validateSendForm = (
  values: SendFormShape,
  helpers: {
    balance: bigint
    walletCore: WalletCore
    t: TFunction
  }
): ValidationResult<SendFormShape> => {
  const { coin, amount, senderAddress, receiverAddress } = values
  const { balance, walletCore, t } = helpers
  const { chain } = coin
  const errors: ValidationResult<SendFormShape> = {}

  if (!coin) errors.coin = t('required_field_missing')

  if (!amount) {
    errors.amount = t('amount_required')
  } else {
    if (amount > balance) {
      errors.amount = t('insufficient_balance')
    }

    if (isOneOf(chain, Object.values(UtxoBasedChain)) && amount) {
      const errorMsg = validateUtxoRequirements({
        amount,
        balance,
        chain,
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

  return errors
}
