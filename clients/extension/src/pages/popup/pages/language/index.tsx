import { Button } from '@clients/extension/src/components/button'
import {
  useLanguageMutation,
  useLanguageQuery,
} from '@clients/extension/src/i18n/state/language'
import { languageName, languages } from '@core/ui/i18n/Language'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const LanguagePage = () => {
  const { t } = useTranslation()
  const navigateBack = useNavigateBack()
  const languageQuery = useLanguageQuery()
  const languageMutation = useLanguageMutation()

  return (
    <VStack fullHeight>
      <PageHeader
        hasBorder
        primaryControls={
          <Button
            icon={<ChevronLeftIcon fontSize={20} />}
            onClick={navigateBack}
            size="sm"
            fitContent
          />
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('language')}
          </Text>
        }
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
