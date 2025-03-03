import { TriangleWarning } from '@clients/extension/src/icons'
import messageKeys from '@clients/extension/src/utils/message-keys'
import { Button } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface ComponentProps {
  onClose: () => void
  description: string
  title: string
}

const Component: FC<ComponentProps> = ({ onClose, description, title }) => {
  const { t } = useTranslation()

  return (
    <>
      <div className="content">
        <div className="vulti-error">
          <span className="badge">
            <TriangleWarning />
            {t(messageKeys.ERROR)}
          </span>
          <span className="title">{title}</span>
          <span className="description">{description}</span>
        </div>
      </div>

      <div className="footer">
        <Button onClick={onClose} type="default" shape="round" block>
          {t(messageKeys.CLOSE)}
        </Button>
      </div>
    </>
  )
}

export default Component
