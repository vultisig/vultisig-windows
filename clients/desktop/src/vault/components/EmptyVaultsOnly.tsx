import { ChildrenProp } from '@lib/ui/props'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { useEffect } from 'react'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { useVaults } from '../queries/useVaultsQuery'

export const EmptyVaultsOnly = ({ children }: ChildrenProp) => {
  const navigate = useAppNavigate()

  const vaults = useVaults()

  const hasVaults = !isEmpty(vaults)

  useEffect(() => {
    if (hasVaults) {
      navigate('vault')
    }
  }, [hasVaults, navigate])

  if (hasVaults) {
    return null
  }

  return <>{children}</>
}
