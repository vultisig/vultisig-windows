import { useVaults } from '@core/ui/vault/state/vaults'
import { VStack } from '@lib/ui/layout/Stack'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'

const LayoutWrapper = styled(VStack)`
  height: 100%;
`

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

  return (
    <LayoutWrapper>
      <Outlet />
    </LayoutWrapper>
  )
}

export default Layout
