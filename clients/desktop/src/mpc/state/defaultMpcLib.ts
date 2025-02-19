import { MpcLib } from '@core/mpc/mpcLib'

import { useIsDklsLibEnabled } from './isDklsLibEnabled'

export const useDefaultMpcLib = (): MpcLib => {
  const [isDklsEnabled] = useIsDklsLibEnabled()

  return isDklsEnabled ? 'DKLS' : 'GG20'
}
