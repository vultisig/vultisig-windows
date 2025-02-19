import routerKeys from '@clients/extension/src/utils/route-keys'
import { getStoredVaults } from '@clients/extension/src/utils/storage'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

interface InitialState {
  loaded: boolean
}

const Component = () => {
  const initialState: InitialState = { loaded: false }
  const [state, setState] = useState(initialState)
  const { loaded } = state
  const navigate = useNavigate()

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      if (vaults.length) {
        setState(prevState => ({ ...prevState, loaded: true }))
      } else {
        navigate(routerKeys.landing, { replace: true })
      }
    })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(componentDidMount, [])

  return loaded ? <Outlet /> : <></>
}

export default Component
