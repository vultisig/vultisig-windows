import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { languageName, languageRegion, languages } from '@core/ui/i18n/Language'
import { useLanguage, useSetLanguageMutation } from '@core/ui/storage/language'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
              extra={key === language && <CircleCheckIcon />}
              key={key}
              onClick={() => setLanguage.mutate(key)}
              title={languageName[key]}
              description={languageRegion[key]}
              hoverable
            />
          ))}
        </List>
      </PageContent>
    </VStack>
  )
}

const CircleCheckIcon = styled(CheckIcon)`
  background-color: ${getColor('buttonPrimary')};
  border-radius: 50%;
  font-size: 16px;
  padding: 2px;
`
