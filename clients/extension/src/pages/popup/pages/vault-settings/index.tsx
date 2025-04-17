import {
  ArrowLeft,
  ArrowRight,
  NoteEdit,
  Trash,
} from '@clients/extension/src/icons'
import { appPaths } from '@clients/extension/src/navigation'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import type { Vault } from '@clients/extension/src/utils/interfaces'
import { getStoredVaults } from '@clients/extension/src/utils/storage'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface InitialState {
  vault?: Vault
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {}
  const [state, setState] = useState(initialState)
  const { vault } = state
  const navigate = useAppNavigate()

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      const vault = vaults.find(({ active }) => active)

      setState(prevState => ({ ...prevState, vault }))
    })
  }

  useEffect(componentDidMount, [])

  return (
    <div className="layout vault-settings-page">
      <div className="header">
        <span className="heading">{vault?.name}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => navigate('settings')}
        />
      </div>
      <div className="content">
        <div className="list list-arrow list-action list-icon">
          <Link to={appPaths.renameVault} state={true} className="list-item">
            <NoteEdit className="icon" />
            <span className="label">{t('rename_vault')}</span>
            <ArrowRight className="action" />
          </Link>
          <Link
            to={appPaths.deleteVault}
            state={true}
            className="list-item warning"
          >
            <Trash className="icon" />
            <span className="label">{t('remove_vault')}</span>
            <ArrowRight className="action" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Component
