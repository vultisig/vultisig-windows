import { TriangleWarning } from '@clients/extension/src/icons'
import { Text } from '@lib/ui/text'
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
            {t('error')}
          </span>
          <Text as="span" size={32} color="contrast" weight={700}>
            {title}
          </Text>
          <span className="description">{description}</span>
        </div>
      </div>

      <div className="footer">
        <Button onClick={onClose} type="default" shape="round" block>
          {t('close')}
        </Button>
      </div>
    </>
  )
}

export default Component
