import { Chain, UtxoBasedChain } from '@core/chain/Chain'
import { validateUtxoRequirements } from '@core/chain/chains/utxo/send/validateUtxoRequirements'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { WalletCore } from '@trustwallet/wallet-core'
import { TFunction } from 'i18next'

import { SendFormShape, ValidationResult } from './formShape'

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

  if (!receiverAddress) {
    errors.receiverAddress = t('send_invalid_receiver_address')
  } else if (
    chain === Chain.Tron &&
    areLowerCaseEqual(senderAddress, receiverAddress)
  ) {
    errors.receiverAddress = t('send_receiver_address_same_as_sender')
  } else if (!isValidAddress({ address: receiverAddress, chain, walletCore })) {
    errors.receiverAddress = t('send_invalid_receiver_address')
  }

  return errors
}
