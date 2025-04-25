import {
  ArrowLeft,
  ArrowRight,
  NoteEdit,
  Trash,
} from '@clients/extension/src/icons'
import { appPaths } from '@clients/extension/src/navigation'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { corePaths } from '@core/ui/navigation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import ReshareIcon from '@lib/ui/icons/ReshareIcon'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

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
          <Link to={corePaths.reshareVault} state={true} className="list-item">
            <IconWrapper className="icon">
              <ReshareIcon />
            </IconWrapper>
            <span className="label">{t('reshare')}</span>
            <ArrowRight className="action" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Component

const IconWrapper = styled.div`
  font-size: 24px;
`
