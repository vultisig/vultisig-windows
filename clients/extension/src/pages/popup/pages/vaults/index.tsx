import useGoBack from '@clients/extension/src/hooks/go-back'
import { ArrowLeft, ArrowRight } from '@clients/extension/src/icons'
import type { VaultProps } from '@clients/extension/src/utils/interfaces'
import routeKeys from '@clients/extension/src/utils/route-keys'
import {
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { Button } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface InitialState {
  vault?: VaultProps
  vaults: VaultProps[]
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = { vaults: [] }
  const [state, setState] = useState(initialState)
  const { vault, vaults } = state
  const navigate = useNavigate()
  const goBack = useGoBack()

  const handleSelect = (uid: string) => {
    setStoredVaults(
      vaults.map(vault => ({ ...vault, active: vault.uid === uid }))
    )
      .then(() => {
        goBack(routeKeys.main)
      })
      .catch(error => {
        console.error('Error setting stored vaults:', error)
      })
  }

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      const vault = vaults.find(({ active }) => active)

      setState(prevState => ({ ...prevState, vault, vaults }))
    })
  }

  useEffect(componentDidMount, [])

  return vault ? (
    <div className="layout vaults-page">
      <div className="header">
        <span className="heading">{t('choose_vault')}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => goBack(routeKeys.main)}
        />
      </div>
      <div className="content">
        <div className="list">
          <div className="list-item">
            <span className="label">{vault?.name}</span>
            <span className="extra">
              <span className="text">{t('active')}</span>
            </span>
          </div>
        </div>
        {vaults.length > 1 && (
          <>
            <span className="divider">{t('other_vaults')}</span>
            <div className="list list-arrow list-action">
              {vaults
                .filter(({ uid }) => uid !== vault.uid)
                .map(({ name, uid }) => (
                  <button
                    key={uid}
                    onClick={() => handleSelect(uid)}
                    className="list-item"
                  >
                    <span className="label">{name}</span>
                    <ArrowRight className="action" />
                  </button>
                ))}
            </div>
          </>
        )}
      </div>
      <div className="footer">
        <Button
          onClick={() => navigate(routeKeys.import, { state: true })}
          shape="round"
          block
        >
          {t('add_new_vault')}
        </Button>
      </div>
    </div>
  ) : (
    <></>
  )
}

export default Component
