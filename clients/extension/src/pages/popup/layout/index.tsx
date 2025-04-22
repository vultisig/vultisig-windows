import { useVaults } from '@core/ui/vault/state/vaults'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'

const Layout = () => {
  const vaults = useVaults()
  const navigate = useAppNavigate()

  useEffect(() => {
    if (!vaults.length) {
      navigate('landing', { replace: true })
    }
  }, [vaults, navigate])

  if (!vaults.length) {
    return null
  }

  return <Outlet />
}

export default Layout
