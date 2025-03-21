import routeKeys from '@clients/extension/src/utils/route-keys'
import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const Component = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="layout landing-page">
      <div className="content">
        <img src="/images/landing.png" alt="logo" className="logo" />
        <span className="title">{t('vultisig_connect')}</span>
        <span className="desc">{t('vultisig_slogan')}</span>
      </div>
      <div className="footer">
        <Button
          onClick={() => navigate(routeKeys.import, { replace: true })}
          type="primary"
          shape="round"
          block
        >
          {t('start')}
        </Button>
      </div>
    </div>
  )
}

export default Component
