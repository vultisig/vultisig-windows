import packageJson from '@clients/extension/package.json'
import { Button } from '@clients/extension/src/components/button'
import { useLanguageQuery } from '@clients/extension/src/i18n/state/language'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { languageName } from '@core/ui/i18n/Language'
import { useFiatCurrency } from '@core/ui/state/fiatCurrency'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { CircleDollarSignIcon } from '@lib/ui/icons/CircleDollarSignIcon'
import { CircleHelpIcon } from '@lib/ui/icons/CircleHelpIcon'
import { ExpandIcon } from '@lib/ui/icons/ExpandIcon'
import { LanguagesIcon } from '@lib/ui/icons/LanguagesIcon'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { VultisigLogoIcon } from '@lib/ui/icons/VultisigLogoIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const SettingsPage = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const currency = useFiatCurrency()
  const languageQuery = useLanguageQuery()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <Button onClick={() => navigate('root')} ghost>
            <ChevronLeftIcon fontSize={20} />
          </Button>
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('settings')}
          </Text>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('vault_specific')}
          </Text>
          <List>
            <ListItem
              icon={<SettingsIcon fontSize={20} />}
              onClick={() => navigate('vaultSettings')}
              title={t('vault_settings')}
              hoverable
              showArrow
            />
          </List>
        </VStack>
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('general')}
          </Text>
          <List>
            <MatchQuery
              success={language => (
                <ListItem
                  extra={languageName[language]}
                  icon={<LanguagesIcon fontSize={20} />}
                  onClick={() => navigate('languageSettings')}
                  title={t('language')}
                  hoverable
                  showArrow
                />
              )}
              value={languageQuery}
            />
            <ListItem
              extra={currency.toUpperCase()}
              icon={<CircleDollarSignIcon fontSize={20} />}
              onClick={() => navigate('currencySettings')}
              title={t('currency')}
              hoverable
              showArrow
            />
            <ListItem
              icon={<CircleHelpIcon fontSize={20} />}
              onClick={() => open('https://vultisig.com/faq', '_blank')}
              title={t('faq')}
              hoverable
              showArrow
            />
            <ListItem
              icon={<ExpandIcon fontSize={20} />}
              onClick={() =>
                open(
                  `chrome-extension://${chrome.runtime.id}/popup.html`,
                  '_blank'
                )
              }
              title={t('expand_view')}
              hoverable
              showArrow
            />
          </List>
        </VStack>
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('other')}
          </Text>
          <List>
            <ListItem
              icon={<VultisigLogoIcon fontSize={20} />}
              onClick={() => open('https://vultisig.com/vult', '_blank')}
              title={t('vult_token')}
              hoverable
            />
          </List>
        </VStack>
      </PageContent>
      <PageFooter alignItems="center">
        <Button
          onClick={() =>
            open(
              'https://chromewebstore.google.com/detail/vulticonnect/ggafhcdaplkhmmnlbfjpnnkepdfjaelb',
              '_blank'
            )
          }
          ghost
        >
          VULTICONNECT V{packageJson.version}
        </Button>
      </PageFooter>
    </VStack>
  )
}
