import { useCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useNavigation } from '@lib/ui/navigation/state'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { useEffect, useState } from 'react'

import { UNAUTHENTICATED_VIEW_IDS } from '../views'
import { useAppNavigate } from './useAppNavigate'

export const useRedirect = () => {
  const [isRedirecting, setIsRedirecting] = useState(true)

  const [{ history }] = useNavigation()
  const navigate = useAppNavigate()
  const hasExistingVault = useCurrentVaultId()
  const { id } = getLastItem(history)

  useEffect(() => {
    if (!hasExistingVault && !UNAUTHENTICATED_VIEW_IDS.includes(id)) {
      navigate({ id: 'newVault' })
    }

    setIsRedirecting(false)
  }, [hasExistingVault, id, navigate])

  return isRedirecting
}
