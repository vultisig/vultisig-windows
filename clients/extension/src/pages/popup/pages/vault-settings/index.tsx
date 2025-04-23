import {
  ArrowLeft,
  ArrowRight,
  NoteEdit,
  Trash,
} from '@clients/extension/src/icons'
import { appPaths } from '@clients/extension/src/navigation'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const Component = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const vault = useCurrentVault()

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
