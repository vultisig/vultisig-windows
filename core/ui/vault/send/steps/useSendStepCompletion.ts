import { isRecordEmpty } from '@vultisig/lib-utils/record/isRecordEmpty'
import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { SendStepCompletion } from '../form/sendSteps'
import { validateSendReceiver } from '../form/validateSendForm'
import { useSendValidationQuery } from '../queries/useSendValidationQuery'
import { useSendAmount } from '../state/amount'
import { useSendAssetFilter } from '../state/assetFilter'
import { useSendFormFieldState } from '../state/formFields'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendAssetListing } from './asset/useSendAssetListing'

/**
 * Which send steps hold a value the user can move past. The address is judged
 * with the same check that advances the address field, so the header and the
 * field never disagree about it. On the asset step the coin counts only while
 * the list shows it, so a chain filter or search that hides it cannot be
 * stepped past.
 */
export const useSendStepCompletion = (): SendStepCompletion => {
  const { t } = useTranslation()
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [amount] = useSendAmount()
  const walletCore = useAssertWalletCore()
  const { data } = useSendValidationQuery()
  const [{ field: step }] = useSendFormFieldState()
  const [{ chain, query }] = useSendAssetFilter()
  const { isSelectedCoinListed } = useSendAssetListing({ filter: chain, query })

  const receiverError = validateSendReceiver({
    receiverAddress: receiver,
    chain: coin.chain,
    senderAddress: coin.address,
    walletCore,
    t,
  })

  return {
    coin: !data?.coin && (step !== 'coin' || isSelectedCoinListed),
    address: receiverError === undefined,
    amount: amount !== null && data !== undefined && isRecordEmpty(data),
  }
}
