import { WalletCore } from '@trustwallet/wallet-core'
import { Chain, UtxoBasedChain } from '@vultisig/core-chain/Chain'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { isValidAddress } from '@vultisig/core-chain/utils/isValidAddress'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'
import { TFunction } from 'i18next'

import { SendFormShape, ValidationResult } from './formShape'
import { validateUtxoSendRequirements } from './validateUtxoSendRequirements'

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
    fee?: bigint
    nativeBalance?: bigint
  }
): ValidationResult<SendFormShape> => {
  const { coin, amount, senderAddress, receiverAddress } = values
  const { balance, walletCore, t, fee, nativeBalance } = helpers
  const { chain } = coin
  const errors: ValidationResult<SendFormShape> = {}

  if (!coin) errors.coin = t('required_field_missing')

  if (!amount) {
    errors.amount = t('amount_required')
  } else {
    if (isFeeCoin(coin) && fee != null) {
      if (amount + fee > balance) {
        errors.amount = t('insufficient_balance')
      }
    } else if (amount > balance) {
      errors.amount = t('insufficient_balance')
    }

    if (
      !isFeeCoin(coin) &&
      nativeBalance != null &&
      fee != null &&
      nativeBalance < fee
    ) {
      errors.amount = t('insufficient_native_balance_for_fee')
    }

    if (isOneOf(chain, Object.values(UtxoBasedChain)) && amount) {
      const errorMsg = validateUtxoSendRequirements({
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

  return errors
}
