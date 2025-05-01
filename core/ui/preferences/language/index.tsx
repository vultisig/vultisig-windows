import {
  useLanguageMutation,
  useLanguageQuery,
} from '@clients/extension/src/i18n/state/language'
import { languageName, languages } from '@core/ui/i18n/Language'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

export const LanguagePage = () => {
  const { t } = useTranslation()
  const languageQuery = useLanguageQuery()
  const languageMutation = useLanguageMutation()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('language')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent flexGrow scrollable>
        <List>
          <MatchQuery
            value={languageQuery}
            success={language =>
              languages.map(key => (
                <ListItem
                  extra={
                    key === language && (
                      <ListItemTag status="success" title={t('active')} />
                    )
                  }
                  key={key}
                  onClick={() => languageMutation.mutate(key)}
                  title={languageName[key]}
                  hoverable
                />
              ))
            }
          />
        </List>
      </PageContent>
    </VStack>
  )
}
