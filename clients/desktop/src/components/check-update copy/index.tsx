import { useAppNavigate } from '@clients/desktop/src/navigation/hooks/useAppNavigate'
import { CloudUploadIcon } from '@lib/ui/icons/CloudUploadIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

export const CheckUpdate = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()

  return (
    <ListItem
      icon={
        <IconWrapper size={20} color="primaryAlt">
          <CloudUploadIcon />
        </IconWrapper>
      }
      onClick={() => navigate({ id: 'checkUpdate' })}
      title={t('check_for_update')}
      hoverable
      showArrow
    />
  )
}
