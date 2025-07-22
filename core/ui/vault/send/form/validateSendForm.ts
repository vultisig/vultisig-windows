import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain, UtxoBasedChain } from '@core/chain/Chain'
import { validateUtxoRequirements } from '@core/chain/chains/utxo/send/validateUtxoRequirements'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { WalletCore } from '@trustwallet/wallet-core'
import { TFunction } from 'i18next'

import { SendFormShape, ValidationResult } from './formShape'

export const validateSendForm = (
  values: SendFormShape,
  helpers: {
    balance: bigint | undefined
    balanceReady: boolean
    coinDecimals: number
    chain: Chain
    walletCore: WalletCore
    t: TFunction
  }
): ValidationResult<SendFormShape> => {
  const { coin, amount, address } = values
  const { balance, balanceReady, coinDecimals, chain, walletCore, t } = helpers

  const errors: ValidationResult<SendFormShape> = {}

  if (!coin) errors.coin = t('required_field_missing')

  if (!amount) {
    errors.amount = t('amount_required')
  } else if (balanceReady) {
    const max = fromChainAmount(balance!, coinDecimals)
    if (amount > max) errors.amount = t('not_enough_for_gas')

    if (
      isOneOf(chain, Object.values(UtxoBasedChain)) &&
      amount &&
      balance !== undefined
    ) {
      const errorMsg = validateUtxoRequirements({
        amount: toChainAmount(amount, coinDecimals),
        balance,
        chain,
      })

      if (errorMsg) {
        errors.amount = errorMsg
      }
    }
  }

  if (!address) {
    errors.address = t('send_invalid_receiver_address')
  } else if (!isValidAddress({ address, chain, walletCore })) {
    errors.address = t('send_invalid_receiver_address')
  }

  return errors
}
