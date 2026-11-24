import { useState } from 'react'

import { KeysignProgress } from '../../action/state/keysignAction'

/**
 * Signature progress of one keysign run, for the signing screen. A report
 * with fewer finished signatures than one already kept is dropped, so a
 * superseded run that is still signing can never move the bar back.
 */
export const useKeysignSignatureProgress = () => {
  const [signatureProgress, setSignatureProgress] = useState<KeysignProgress>()

  const reportSignatureProgress = (next: KeysignProgress) =>
    setSignatureProgress(previous =>
      previous && previous.done >= next.done ? previous : next
    )

  return { signatureProgress, reportSignatureProgress }
}
