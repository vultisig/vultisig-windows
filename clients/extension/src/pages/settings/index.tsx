import packageJson from '@clients/extension/package.json'
import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { languageName } from '@core/ui/i18n/Language'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useLanguage } from '@core/ui/storage/language'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { CircleDollarSignIcon } from '@lib/ui/icons/CircleDollarSignIcon'
import { CircleHelpIcon } from '@lib/ui/icons/CircleHelpIcon'
import { CircleStopIcon } from '@lib/ui/icons/CircleStopIcon'
import { DefaultChainsIcon } from '@lib/ui/icons/DefaultChainsIcon'
import { ExpandIcon } from '@lib/ui/icons/ExpandIcon'
import { LanguagesIcon } from '@lib/ui/icons/LanguagesIcon'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const SettingsPage = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const navigateBack = useNavigateBack()
  const coreNavigate = useCoreNavigate()
  const currency = useFiatCurrency()
  const language = useLanguage()

  return (
    <VStack fullHeight>
      <PageHeader
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
              extra={<Switch />}
              onClick={() => {}}
              title={t('prioritize_vultisig')}
              hoverable
            />
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
            <ListItem
              extra={languageName[language]}
              icon={<LanguagesIcon fontSize={20} />}
              onClick={() => coreNavigate('languageSettings')}
              title={t('language')}
              hoverable
              showArrow
            />
            <ListItem
              extra={currency.toUpperCase()}
              icon={<CircleDollarSignIcon fontSize={20} />}
              onClick={() => coreNavigate('currencySettings')}
              title={t('currency')}
              hoverable
              showArrow
            />
            <ListItem
              icon={<DefaultChainsIcon fontSize={20} />}
              onClick={() => coreNavigate('defaultChains')}
              title={t('vault_settings_default_chains')}
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
              icon={<CircleStopIcon fontSize={20} />}
              onClick={() => open('https://vultisig.com/vult', '_blank')}
              title={t('vult_token')}
              hoverable
            />
            <ListItem
              icon={<ShareIcon fontSize={20} />}
              onClick={() => {}}
              title={t('share_vault')}
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
          size="xs"
          type="link"
          fitContent
        >
          VULTICONNECT V{packageJson.version}
        </Button>
      </PageFooter>
    </VStack>
  )
}
