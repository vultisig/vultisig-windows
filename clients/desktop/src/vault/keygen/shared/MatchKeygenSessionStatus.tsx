import { ReactNode, useEffect, useState } from 'react'

import { EventsOff, EventsOn } from '../../../../wailsjs/runtime/runtime'

export const keygenStatuses = ['prepareVault', 'ecdsa', 'eddsa'] as const

export type KeygenStatus = (typeof keygenStatuses)[number]

type MatchKeygenSessionStatusProps = {
  pending: () => ReactNode
  active: (status: KeygenStatus) => ReactNode
}

export const MatchKeygenSessionStatus = ({
  pending,
  active,
}: MatchKeygenSessionStatusProps) => {
  const [status, setStatus] = useState<KeygenStatus | null>(null)

  useEffect(() => {
    const prepareVaultListenerName = 'PrepareVault'
    const ecdsaListenerName = 'ECDSA'
    const eddsaListenerName = 'EdDSA'

    EventsOn(prepareVaultListenerName, () => setStatus('prepareVault'))
    EventsOn(ecdsaListenerName, () => setStatus('ecdsa'))
    EventsOn(eddsaListenerName, () => setStatus('eddsa'))

    return () => {
      EventsOff(prepareVaultListenerName)
      EventsOff(ecdsaListenerName)
      EventsOff(eddsaListenerName)
    }
  }, [])

  return <>{status === null ? pending() : active(status)}</>
}
