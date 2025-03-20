import { TitleProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { KeygenEducationPrompt } from './KeygenEducationPrompt'

export const KeygenPageHeader = ({ title }: Partial<TitleProp>) => {
  const { t } = useTranslation()

  return (
    <PageHeader
      primaryControls={<PageHeaderBackButton />}
      title={<PageHeaderTitle>{title ?? t('keygen')}</PageHeaderTitle>}
      secondaryControls={<KeygenEducationPrompt />}
    />
  )
}
