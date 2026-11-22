import { KeysignProgress } from '../../action/state/keysignAction'

const fullProgress = 100

type GetSignatureTrackedProgressInput = KeysignProgress & {
  startProgress: number
}

/**
 * Bar position for a keysign with several signatures: each finished
 * signature advances an equal share of what is left above `startProgress`,
 * the point the bar had already reached when counting began. Full only once
 * every signature is done.
 */
export const getSignatureTrackedProgress = ({
  done,
  total,
  startProgress,
}: GetSignatureTrackedProgressInput) =>
  done >= total
    ? fullProgress
    : Math.floor(
        startProgress + ((fullProgress - startProgress) * done) / total
      )
