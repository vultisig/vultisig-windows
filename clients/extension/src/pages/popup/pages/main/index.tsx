import {
  ArrowRight,
  BrokenLink,
  CircleInfo,
  SettingsTwo,
  Vultisig,
} from '@clients/extension/src/icons'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
import messageKeys from '@clients/extension/src/utils/message-keys'
import routeKeys from '@clients/extension/src/utils/route-keys'
import {
  getIsPriority,
  getStoredChains,
  getStoredVaults,
  setIsPriority,
  setStoredChains,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Button, Empty, message, Modal, Select, Switch, Tooltip } from 'antd'
import { type FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { isSupportedChain } from '../../../../utils/constants'
const VULTISIG_WEB_URL = 'https://airdrop.vultisig.com'

interface SelectOption {
  value: string
  label: JSX.Element
}

interface InitialState {
  isPriority: boolean
  networkOptions: SelectOption[]
  selectedNetwork?: SelectOption
  vault?: VaultProps
}

const ConnectedApp: FC<{ domain: string; onUnlink: () => void }> = ({
  domain,
  onUnlink,
}) => {
  const { t } = useTranslation()
  const [sld, tld] = domain.split('.').slice(-2)

  return (
    <div className="item">
      <span className="name">{`${sld}.${tld}`}</span>
      <button className="btn" onClick={onUnlink}>
        <BrokenLink />
        {t(messageKeys.UNLINK)}
      </button>
    </div>
  )
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = { isPriority: false, networkOptions: [] }
  const [state, setState] = useState(initialState)
  const { isPriority, networkOptions, selectedNetwork, vault } = state
  const [modal, contextHolder] = Modal.useModal()
  const navigate = useNavigate()
  const [messageApi, messageContextHolder] = message.useMessage()

  const handleUnlink = (app: string): void => {
    modal.confirm({
      title: 'Confirm',
      width: 312,
      onOk() {
        getStoredVaults().then(vaults => {
          setStoredVaults(
            vaults.map(item =>
              item.uid === vault?.uid
                ? { ...item, apps: item.apps?.filter(item => item !== app) }
                : item
            )
          ).then(() => {
            componentDidMount()
          })
        })
      },
    })
  }

  const handleViewinWeb = () => {
    if (!vault?.publicKeyEcdsa || !vault?.publicKeyEddsa) {
      console.error('Missing required vault keys')
      return
    }
    const url = `${VULTISIG_WEB_URL}/redirect/${vault?.publicKeyEcdsa}/${vault?.publicKeyEddsa}`
    try {
      new URL(url)
    } catch (error) {
      console.error('Invalid URL:', error)
      return
    }
    chrome.tabs.create({ url })
  }

  const getCurrentNetwork = (options: SelectOption[]) => {
    getStoredChains().then(chains => {
      const activeChain = chains.find(({ active }) => active)

      const selectedNetwork = options.find(
        option => option.value === activeChain?.chain
      )

      setState(prevState => ({ ...prevState, selectedNetwork }))
    })
  }

  const handleChangeNetwork = (selectedOption: SelectOption) => {
    const selectedNetwork = networkOptions.find(
      option => option.value === String(selectedOption)
    )
    if (selectedNetwork) {
      setStoredChains(
        Object.values(chainFeeCoin)
          .filter(chain => isSupportedChain(chain.chain))
          .map(chain => ({
            ...chain,
            active: chain.chain === selectedNetwork.value,
          }))
      ).then(() => {
        setState(prevState => ({ ...prevState, selectedNetwork }))
      })
    }
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
      content: t(t(messageKeys.REALOAD_MESSAGE)),
    })
  }

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      const vault = vaults.find(({ active }) => active)

      if (vault) {
        const supportedChains = vault.chains
        const networkOptions = supportedChains.map(chain => ({
          value: chain.chain,
          label: (
            <>
              <div className="chain-item">
                <img
                  src={`/chains/${chain.chain.toLowerCase()}.svg`}
                  alt={chain.chain}
                  style={{ width: 20, marginRight: 8 }}
                />
                {chain.chain}
              </div>
              <span className="address">{chain.address}</span>
            </>
          ),
        }))

        setState({ ...state, networkOptions })

        getCurrentNetwork(networkOptions)

        getIsPriority().then(isPriority => {
          setState(prevState => ({ ...prevState, isPriority, vault }))
        })
      }
    })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(componentDidMount, [])

  return vault ? (
    <>
      <div className="layout main-page">
        <div className="header">
          <Vultisig className="logo" />
          <span className="logo-type">{t(messageKeys.VULTISIG)}</span>
          <SettingsTwo
            className="icon icon-right"
            onClick={() => navigate(routeKeys.settings.root, { state: true })}
          />
        </div>
        <div className="content">
          <div className="list list-action list-arrow">
            <Link to={routeKeys.vaults} state={true} className="list-item">
              <span className="label">{vault.name}</span>
              <ArrowRight className="action" />
            </Link>
          </div>
          <div className="view">
            <Button onClick={handleViewinWeb} block>
              {t(messageKeys.VIEW_IN_AIRDROP)}
            </Button>
          </div>
          <span className="divider">{t(messageKeys.CURRENT_NETWORK)}</span>
          <div>
            <Select
              className="select"
              options={networkOptions}
              value={selectedNetwork}
              onChange={value => handleChangeNetwork(value)}
            />
          </div>
          <span className="divider">{t(messageKeys.CONNECTED_DAPPS)}</span>
          <div className="apps">
            <div className="action">
              <div className="title">
                {t(messageKeys.PRIORITIZE_VULTICONNECT)}
                <Tooltip title={t(messageKeys.PRIORITIZE_VULTICONNECT_HINT)}>
                  <CircleInfo className="icon" />
                </Tooltip>
              </div>
              <Switch
                checked={isPriority}
                onChange={checked => handlePriority(checked)}
              />
            </div>
            {vault?.apps?.length ? (
              vault.apps.map(app => (
                <ConnectedApp
                  key={app}
                  domain={app}
                  onUnlink={() => handleUnlink(app)}
                />
              ))
            ) : (
              <Empty description={t(messageKeys.NO_CONNECTED_APP)} />
            )}
          </div>
        </div>
      </div>
      {messageContextHolder}
      {contextHolder}
    </>
  ) : (
    <></>
  )
}

export default Component
