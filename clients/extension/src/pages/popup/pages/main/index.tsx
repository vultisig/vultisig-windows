import {
  ArrowRight,
  CircleInfo,
  SettingsTwo,
  Vultisig,
} from '@clients/extension/src/icons'
import { appPaths } from '@clients/extension/src/navigation'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { setIsPriority } from '@clients/extension/src/utils/storage'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button, message, Switch, Tooltip } from 'antd'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface SelectOption {
  value: string
  label: ReactNode
}

interface InitialState {
  isPriority: boolean
  networkOptions: SelectOption[]
  selectedNetwork?: SelectOption
}

// TODO: introduce connected apps
// const ConnectedApp: FC<{ domain: string; onUnlink: () => void }> = ({
//   domain,
//   onUnlink,
// }) => {
//   const { t } = useTranslation()
//   const [sld, tld] = domain.split('.').slice(-2)

//   return (
//     <div className="item">
//       <span className="name">{`${sld}.${tld}`}</span>
//       <button className="btn" onClick={onUnlink}>
//         <BrokenLink />
//         {t('unlink')}
//       </button>
//     </div>
//   )
// }

const Component = () => {
  // This page will be replaced with the new design
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const initialState: InitialState = { isPriority: false, networkOptions: [] }
  const [state, setState] = useState(initialState)
  const { isPriority } = state

  const navigate = useAppNavigate()
  const [messageApi, messageContextHolder] = message.useMessage()

  // TODO: introduce connected apps
  // const handleUnlink = (app: string): void => {
  // modal.confirm({
  //   title: 'Confirm',
  //   width: 312,
  //   onOk() {
  //     getStoredVaults().then(vaults => {
  //       setStoredVaults(
  //         vaults.map(item =>
  //           item.uid === vault?.uid
  //             ? { ...item, apps: item.apps?.filter(item => item !== app) }
  //             : item
  //         )
  //       ).then(() => {
  //         // initComponent()
  //       })
  //     })
  //   },
  // })
  // }

  const handleViewinWeb = () => {
    const VULTISIG_WEB_URL = 'https://airdrop.vultisig.com'
    const url = `${VULTISIG_WEB_URL}/redirect/${vault?.publicKeys.ecdsa}/${vault?.publicKeys.eddsa}`
    chrome.tabs.create({ url })
  }

  const handlePriority = (checked: boolean) => {
    setIsPriority(checked).then(() => {
      setState(prevState => ({ ...prevState, isPriority: checked }))

      showReloadMessage()
    })
  }

  const showReloadMessage = () => {
    messageApi.open({
      type: 'info',
      content: t('reload_message'),
    })
  }

  return vault ? (
    <>
      <div className="layout main-page">
        <div className="header">
          <Vultisig className="logo" />
          <span className="logo-type">{t('vultisig')}</span>
          <SettingsTwo
            className="icon icon-right"
            onClick={() => navigate('settings')}
          />
        </div>
        <div className="content">
          <div className="list list-action list-arrow">
            <Link to={appPaths.vaults} state={true} className="list-item">
              <span className="label">{vault.name}</span>
              <ArrowRight className="action" />
            </Link>
          </div>
          <div className="view">
            <Button onClick={handleViewinWeb} block>
              {t('view_in_airdrop')}
            </Button>
          </div>
          <span className="divider">{t('current_network')}</span>
          <span className="divider">{t('connected_apps')}</span>
          <div className="apps">
            <div className="action">
              <div className="title">
                {t('prioritize_vulticonnect')}
                <Tooltip title={t('prioritize_vulticonnect_hint')}>
                  <CircleInfo className="icon" />
                </Tooltip>
              </div>
              <Switch
                checked={isPriority}
                onChange={checked => handlePriority(checked)}
              />
            </div>
            {/* TODO: introduce connected apps */}

            {/* {vault?.apps?.length ? (
              vault.apps.map(app => (
                <ConnectedApp
                  key={app}
                  domain={app}
                  onUnlink={() => handleUnlink(app)}
                />
              ))
            ) : (
              <Empty description={t('no_connected_app')} />
            )} */}
          </div>
        </div>
      </div>
      {messageContextHolder}
      {/* {contextHolder} */}
    </>
  ) : (
    <></>
  )
}

export default Component
