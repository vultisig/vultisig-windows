import { Outlet } from 'react-router-dom'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { useVaults } from '../../../vault/state/vaults'

const Layout = () => {
  const vaults = useVaults()
  const navigate = useAppNavigate()

  if (!vaults.length) {
    navigate('landing', { replace: true })
  }

  return <Outlet />
}

export default Layout
