import { languageName } from '@core/ui/i18n/Language'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Client, useCore } from '@core/ui/state/core'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useLanguage } from '@core/ui/storage/language'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { BookMarkedIcon } from '@lib/ui/icons/BookMarkedIcon'
import { CircleDollarSignIcon } from '@lib/ui/icons/CircleDollarSignIcon'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { DiscordIcon } from '@lib/ui/icons/DiscordIcon'
import { FacebookIcon } from '@lib/ui/icons/FacebookIcon'
import { FileTextIcon } from '@lib/ui/icons/FileTextIcon'
import { GithubIcon } from '@lib/ui/icons/GithubIcon'
import { LanguagesIcon } from '@lib/ui/icons/LanguagesIcon'
import { LinkedinIcon } from '@lib/ui/icons/LinkedinIcon'
import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { MessageCircleQuestionIcon } from '@lib/ui/icons/MessageCircleQuestionIcon'
import { RedditIcon } from '@lib/ui/icons/RedditIcon'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { ShareTwoIcon } from '@lib/ui/icons/ShareTwoIcon'
import { ShieldCheckIcon } from '@lib/ui/icons/ShieldCheckIcon'
import { TwitterIcon } from '@lib/ui/icons/TwitterIcon'
import { VultisigLogoIcon } from '@lib/ui/icons/VultisigLogoIcon'
import { WhatsAppIcon } from '@lib/ui/icons/WhatsAppIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Modal } from '@lib/ui/modal'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { FC, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ExtensionSettings {
  client: Extract<Client, 'extension'>
  expandView: ReactNode
  prioritize: ReactNode
}

interface DesktopSettings {
  client: Extract<Client, 'desktop'>
  checkUpdate: ReactNode
  manageMpcLib: ReactNode
}

export const SettingsPage: FC<DesktopSettings | ExtensionSettings> = props => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const { addToast } = useToast()
  const { openUrl, version } = useCore()
  const navigate = useCoreNavigate()
  const currency = useFiatCurrency()
  const language = useLanguage()
  const shareURL =
    props.client === 'desktop'
      ? 'https://vultisig.com/download/vultisig'
      : 'https://chromewebstore.google.com/detail/ggafhcdaplkhmmnlbfjpnnkepdfjaelb'

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareURL)
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
          primaryControls={<PageHeaderBackButton />}
          title={<PageHeaderTitle>{t('settings')}</PageHeaderTitle>}
          hasBorder
        />
        <PageContent gap={24} flexGrow scrollable>
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('vault')}
            </Text>
            <List>
              {props.client === 'extension' && props.prioritize}
              <ListItem
                icon={<SettingsIcon fontSize={20} />}
                onClick={() => navigate({ id: 'vaultSettings' })}
                title={t('vault_settings')}
                hoverable
                showArrow
              />
              <ListItem
                icon={<VultisigLogoIcon fontSize={20} />}
                onClick={() => navigate({ id: 'airdropRegister' })}
                status="success"
                title={t('register_your_vaults')}
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
                icon={<BookMarkedIcon fontSize={20} />}
                onClick={() => navigate({ id: 'addressBook' })}
                title={t('address_book')}
                hoverable
                showArrow
              />
              <ListItem
                icon={<MegaphoneIcon fontSize={20} />}
                onClick={() => {}}
                title={t('referral_code')}
                hoverable
                showArrow
              />
              {props.client === 'extension' && props.expandView}
            </List>
          </VStack>
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('support')}
            </Text>
            <List>
              <ListItem
                icon={<MessageCircleQuestionIcon fontSize={20} />}
                onClick={() => openUrl('https://vultisig.com/faq')}
                title={t('faq')}
                hoverable
                showArrow
              />
              {props.client === 'desktop' && props.checkUpdate}
              <ListItem
                icon={<ShareTwoIcon fontSize={20} />}
                onClick={() => setVisible(true)}
                title={t('share_app')}
                hoverable
                showArrow
              />
            </List>
          </VStack>
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('vultisig_community')}
            </Text>
            <List>
              <ListItem
                icon={<TwitterIcon fontSize={20} />}
                onClick={() => openUrl('https://x.com/vultisig')}
                title={t('twitter')}
                hoverable
                showArrow
              />
              <ListItem
                icon={<DiscordIcon fontSize={20} />}
                onClick={() => openUrl('https://discord.gg/ngvW8tRRfB')}
                title={t('discord')}
                hoverable
                showArrow
              />
              <ListItem
                icon={<GithubIcon fontSize={20} />}
                onClick={() =>
                  openUrl('https://github.com/vultisig/vultisig-windows')
                }
                title={t('github')}
                hoverable
                showArrow
              />
            </List>
          </VStack>
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('legal')}
            </Text>
            <List>
              <ListItem
                icon={<ShieldCheckIcon fontSize={20} />}
                onClick={() => openUrl('https://vultisig.com/privacy')}
                title={t('privacy_policy')}
                hoverable
                showArrow
              />
              <ListItem
                icon={<FileTextIcon fontSize={20} />}
                onClick={() => openUrl('https://vultisig.com/termofservice')}
                title={t('terms_of_service')}
                hoverable
                showArrow
              />
            </List>
          </VStack>
        </PageContent>
        <PageFooter alignItems="center" gap={8}>
          <UnstyledButton onClick={() => openUrl(shareURL)}>
            {`VULTISIG ${props.client === 'desktop' ? 'APP' : 'EXTENSION'} V${version}`}
          </UnstyledButton>
          {props.client === 'desktop' && props.manageMpcLib}
        </PageFooter>
      </VStack>
      {visible && (
        <Modal
          onClose={() => setVisible(false)}
          placement="center"
          title="Vultisig"
          width={368}
        >
          <VStack gap={24}>
            <VStack gap={14}>
              <Text color="light" size={13} weight={500}>
                {t('share_app')}
              </Text>
              <HStack gap={8} alignItems="center">
                <IconButton
                  icon={<LinkedinIcon fontSize={38} />}
                  onClick={() =>
                    openUrl(
                      `https://linkedin.com/sharing/share-offsite/?url=${shareURL}?utm_source=item-share-linkedin`
                    )
                  }
                  size="l"
                />
                <IconButton
                  icon={<FacebookIcon fontSize={38} />}
                  onClick={() =>
                    openUrl(
                      `https://facebook.com/sharer/sharer.php?u=${shareURL}?utm_source=item-share-facebook`
                    )
                  }
                  size="l"
                />
                <IconButton
                  icon={<RedditIcon fontSize={38} />}
                  onClick={() =>
                    openUrl(
                      `https://reddit.com/submit?url=${shareURL}?utm_source=item-share-reddit`
                    )
                  }
                  size="l"
                />
                <IconButton
                  icon={<WhatsAppIcon fontSize={38} />}
                  onClick={() =>
                    openUrl(
                      `https://wa.me/?text=${shareURL}?utm_source=item-share-whatsapp`
                    )
                  }
                  size="l"
                />
                <IconButton
                  icon={<TwitterIcon fontSize={38} />}
                  onClick={() =>
                    openUrl(
                      `https://twitter.com/intent/tweet?url=${shareURL}?utm_source=item-share-x`
                    )
                  }
                  size="l"
                />
              </HStack>
            </VStack>
            <HStack gap={8} alignItems="center">
              <Text color="contrast" size={13} weight={500} cropped>
                {shareURL}
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
