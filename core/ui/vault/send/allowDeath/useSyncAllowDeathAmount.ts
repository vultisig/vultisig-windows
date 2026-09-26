import { useEffect } from 'react'

import { useSendAmount } from '../state/amount'
import { useAllowDeathSendAmount } from './useAllowDeathSendAmount'

/**
 * Holds the amount at the whole balance less the fee for as long as the user
 * has chosen to empty the account, including after the fee or balance is
 * refreshed. Mounted with the send form so it runs whichever field is open.
 * Returns whether the amount is still catching up.
 */
export const useSyncAllowDeathAmount = () => {
  const [, setAmount] = useSendAmount()
  const { target, isSyncing } = useAllowDeathSendAmount()

  useEffect(() => {
    if (isSyncing && target !== null && target > 0n) {
      setAmount(target)
    }
  }, [isSyncing, setAmount, target])

  return isSyncing
}
