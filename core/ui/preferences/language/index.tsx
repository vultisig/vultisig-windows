import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { languageName, languages } from '@core/ui/i18n/Language'
import { useLanguage, useSetLanguageMutation } from '@core/ui/storage/language'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

export const LanguagePage = () => {
  const { t } = useTranslation()
  const language = useLanguage()
  const setLanguage = useSetLanguageMutation()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('language')}
        hasBorder
      />
      <PageContent flexGrow scrollable>
        <List>
          {languages.map(key => (
            <ListItem
              extra={
                key === language && (
                  <ListItemTag status="success" title={t('active')} />
                )
              }
              key={key}
              onClick={() => setLanguage.mutate(key)}
              title={languageName[key]}
              hoverable
            />
          ))}
        </List>
      </PageContent>
    </VStack>
  )
}
