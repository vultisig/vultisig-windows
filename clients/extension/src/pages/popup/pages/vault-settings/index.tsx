import useGoBack from '@clients/extension/src/hooks/go-back'
import {
  ArrowLeft,
  ArrowRight,
  NoteEdit,
  Trash,
} from '@clients/extension/src/icons'
import type { VaultProps } from '@clients/extension/src/utils/interfaces'
import { getStoredVaults } from '@clients/extension/src/utils/storage'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { appPaths } from '../../../../navigation'

interface InitialState {
  vault?: VaultProps
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {}
  const [state, setState] = useState(initialState)
  const { vault } = state
  const goBack = useGoBack()

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
          onClick={() => goBack(appPaths.settings.root)}
        />
      </div>
      <div className="content">
        <div className="list list-arrow list-action list-icon">
          <Link
            to={appPaths.settings.rename}
            state={true}
            className="list-item"
          >
            <NoteEdit className="icon" />
            <span className="label">{t('rename_vault')}</span>
            <ArrowRight className="action" />
          </Link>
          <Link
            to={appPaths.settings.delete}
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
