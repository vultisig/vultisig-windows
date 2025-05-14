import packageJson from '@clients/extension/package.json'
import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import {
  useIsPrioritizedWalletQuery,
  useSetPrioritizeWalletMutation,
} from '@clients/extension/src/state/currentSettings/isPrioritized'
import { languageName } from '@core/ui/i18n/Language'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useLanguage } from '@core/ui/storage/language'
import { IconButton } from '@lib/ui/buttons/IconButton'
import AddressBookIcon from '@lib/ui/icons/AddressBookIcon'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { CircleDollarSignIcon } from '@lib/ui/icons/CircleDollarSignIcon'
import { CircleHelpIcon } from '@lib/ui/icons/CircleHelpIcon'
import { CircleStopIcon } from '@lib/ui/icons/CircleStopIcon'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { DefaultChainsIcon } from '@lib/ui/icons/DefaultChainsIcon'
import { ExpandIcon } from '@lib/ui/icons/ExpandIcon'
import { FacebookIcon } from '@lib/ui/icons/FacebookIcon'
import { LanguagesIcon } from '@lib/ui/icons/LanguagesIcon'
import { LinkedinIcon } from '@lib/ui/icons/LinkedinIcon'
import { RedditIcon } from '@lib/ui/icons/RedditIcon'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { TwitterIcon } from '@lib/ui/icons/TwitterIcon'
import { WhatsAppIcon } from '@lib/ui/icons/WhatsAppIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Modal } from '@lib/ui/modal'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const SettingsPage = () => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const { addToast } = useToast()
  const navigate = useCoreNavigate()
  const navigateBack = useNavigateBack()
  const appNavigate = useAppNavigate()
  const currency = useFiatCurrency()
  const language = useLanguage()
  const { data: isPrioritized } = useIsPrioritizedWalletQuery()
  const { mutate: setPrioritize } = useSetPrioritizeWalletMutation()
  const chromeStore =
    'https://chromewebstore.google.com/detail/ggafhcdaplkhmmnlbfjpnnkepdfjaelb'

  const handleCopy = () => {
    navigator.clipboard
      .writeText(chromeStore)
      .then(() => {
        addToast({ message: t('link_copied') })
      })
      .catch(() => {
        addToast({ message: t('failed_to_copy_link') })
      })
  }

  return (
    <>
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
                extra={<Switch checked={isPrioritized} />}
                onClick={() => setPrioritize(!isPrioritized)}
                title={t('prioritize_vultisig')}
                hoverable
              />
              <ListItem
                icon={<SettingsIcon fontSize={20} />}
                onClick={() => appNavigate({ id: 'vaultSettings' })}
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
                onClick={() => navigate({ id: 'languageSettings' })}
                title={t('language')}
                hoverable
                showArrow
              />
              <ListItem
                extra={currency.toUpperCase()}
                icon={<CircleDollarSignIcon fontSize={20} />}
                onClick={() => navigate({ id: 'currencySettings' })}
                title={t('currency')}
                hoverable
                showArrow
              />
              <ListItem
                icon={<AddressBookIcon size={20} />}
                onClick={() => navigate({ id: 'addressBook' })}
                title={t('vault_settings_address_book')}
                hoverable
                showArrow
              />
              <ListItem
                icon={<DefaultChainsIcon fontSize={20} />}
                onClick={() => navigate({ id: 'defaultChains' })}
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
                    `chrome-extension://${chrome.runtime.id}/index.html`,
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
                onClick={() => setVisible(true)}
                title={t('share_vault')}
                hoverable
              />
            </List>
          </VStack>
        </PageContent>
        <PageFooter alignItems="center">
          <Button
            onClick={() => open(chromeStore, '_blank')}
            size="xs"
            type="link"
            fitContent
          >
            VULTICONNECT V{packageJson.version}
          </Button>
        </PageFooter>
      </VStack>
      {visible && (
        <Modal
          onClose={() => setVisible(false)}
          placement="center"
          title="VultiConnect"
          width={368}
        >
          <VStack gap={24}>
            <VStack gap={14}>
              <Text color="light" size={13} weight={500}>
                {t('extension_share_app')}
              </Text>
              <HStack gap={8} alignItems="center">
                <IconButton
                  icon={<LinkedinIcon fontSize={38} />}
                  onClick={() =>
                    open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${chromeStore}?utm_source=item-share-linkedin`,
                      '_blank'
                    )
                  }
                  size="l"
                />
                <IconButton
                  icon={<FacebookIcon fontSize={38} />}
                  onClick={() =>
                    open(
                      `https://www.facebook.com/sharer/sharer.php?u=${chromeStore}?utm_source=item-share-facebook`,
                      '_blank'
                    )
                  }
                  size="l"
                />
                <IconButton
                  icon={<RedditIcon fontSize={38} />}
                  onClick={() =>
                    open(
                      `https://www.reddit.com/submit?url=${chromeStore}?utm_source=item-share-reddit`,
                      '_blank'
                    )
                  }
                  size="l"
                />
                <IconButton
                  icon={<WhatsAppIcon fontSize={38} />}
                  onClick={() =>
                    open(
                      `https://wa.me/?text=${chromeStore}?utm_source=item-share-whatsapp`,
                      '_blank'
                    )
                  }
                  size="l"
                />
                <IconButton
                  icon={<TwitterIcon fontSize={38} />}
                  onClick={() =>
                    open(
                      `https://twitter.com/intent/tweet?url=${chromeStore}?utm_source=item-share-x`,
                      '_blank'
                    )
                  }
                  size="l"
                />
              </HStack>
            </VStack>
            <HStack gap={8} alignItems="center">
              <Text color="contrast" size={13} weight={500} cropped>
                {chromeStore}
              </Text>
              <IconButton
                icon={<CopyIcon fontSize={20} />}
                onClick={handleCopy}
              />
            </HStack>
          </VStack>
        </Modal>
      )}
    </>
  )
}
