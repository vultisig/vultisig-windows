import { Chain } from '@core/chain/Chain'
import { desktopDownloadUrl } from '@core/config'
import { ManageBlockaid } from '@core/ui/chain/security/blockaid/ManageBlockaid'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { languageName } from '@core/ui/i18n/Language'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsSection } from '@core/ui/settings/SettingsSection'
import { Client, useCore } from '@core/ui/state/core'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useLanguage } from '@core/ui/storage/language'
import { useHasPasscodeEncryption } from '@core/ui/storage/passcodeEncryption'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { BookMarkedIcon } from '@lib/ui/icons/BookMarkedIcon'
import { CircleDollarSignIcon } from '@lib/ui/icons/CircleDollarSignIcon'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { DiscordIcon } from '@lib/ui/icons/DiscordIcon'
import { FacebookIcon } from '@lib/ui/icons/FacebookIcon'
import { FileTextIcon } from '@lib/ui/icons/FileTextIcon'
import { GithubIcon } from '@lib/ui/icons/GithubIcon'
import { LanguagesIcon } from '@lib/ui/icons/LanguagesIcon'
import { LinkedinIcon } from '@lib/ui/icons/LinkedinIcon'
import { LockKeyholeIcon } from '@lib/ui/icons/LockKeyholeIcon'
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
import { ListItem } from '@lib/ui/list/item'
import { Modal } from '@lib/ui/modal'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { FC, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ExtensionSettings = {
  client: Extract<Client, 'extension'>
  expandView: ReactNode
  insiderOptions: ReactNode
  prioritize: ReactNode
}

type DesktopSettings = {
  client: Extract<Client, 'desktop'>
  checkUpdate: ReactNode
  insiderOptions: ReactNode
}

const iconSize = 20

export const SettingsPage: FC<DesktopSettings | ExtensionSettings> = props => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const { addToast } = useToast()
  const { openUrl } = useCore()
  const navigate = useCoreNavigate()
  const currency = useFiatCurrency()
  const language = useLanguage()
  const shareURL =
    props.client === 'desktop'
      ? desktopDownloadUrl
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

  const hasPasscodeEncryption = useHasPasscodeEncryption()
  const addresses = useCurrentVaultAddresses()
  const areReferralEnabled = Boolean(addresses[Chain.THORChain])

  return (
    <>
      <VStack fullHeight>
        <PageHeader
          primaryControls={
            <PageHeaderBackButton
              onClick={() =>
                navigate({
                  id: 'vault',
                })
              }
            />
          }
          title={t('settings')}
          hasBorder
        />
        <PageContent gap={24} flexGrow scrollable>
          <SettingsSection title={t('vault')}>
            {props.client === 'extension' && props.prioritize}
            <ListItem
              icon={<SettingsIcon fontSize={iconSize} />}
              onClick={() => navigate({ id: 'vaultSettings' })}
              title={t('vault_settings')}
              hoverable
              showArrow
            />
            <ListItem
              icon={<VultisigLogoIcon fontSize={iconSize} />}
              onClick={() => navigate({ id: 'airdropRegister' })}
              status="success"
              title={t('register_your_vaults')}
              hoverable
              showArrow
            />
          </SettingsSection>

          <SettingsSection title={t('general')}>
            <ListItem
              extra={languageName[language]}
              icon={<LanguagesIcon fontSize={iconSize} />}
              onClick={() => navigate({ id: 'languageSettings' })}
              title={t('language')}
              hoverable
              showArrow
            />
            <ListItem
              extra={currency.toUpperCase()}
              icon={<CircleDollarSignIcon fontSize={iconSize} />}
              onClick={() => navigate({ id: 'currencySettings' })}
              title={t('currency')}
              hoverable
              showArrow
            />
            <ListItem
              icon={<BookMarkedIcon fontSize={iconSize} />}
              onClick={() => navigate({ id: 'addressBook' })}
              title={t('address_book')}
              hoverable
              showArrow
            />
            {areReferralEnabled && (
              <ListItem
                icon={<MegaphoneIcon fontSize={iconSize} />}
                onClick={() => navigate({ id: 'referral' })}
                title={t('referral_code')}
                hoverable
                showArrow
              />
            )}
            {props.client === 'extension' && props.expandView}
          </SettingsSection>
          <SettingsSection title={t('security')}>
            <ListItem
              icon={<ShieldCheckIcon fontSize={iconSize} />}
              onClick={() => navigate({ id: 'managePasscodeEncryption' })}
              title={t('security')}
              hoverable
              showArrow
            />
            {hasPasscodeEncryption && (
              <ListItem
                icon={<LockKeyholeIcon fontSize={iconSize} />}
                onClick={() => navigate({ id: 'passcodeAutoLock' })}
                title={t('lock_time')}
                hoverable
                showArrow
              />
            )}
            <ManageBlockaid />
          </SettingsSection>
          <SettingsSection title={t('support')}>
            <ListItem
              icon={<MessageCircleQuestionIcon fontSize={iconSize} />}
              onClick={() => openUrl('https://vultisig.com/faq')}
              title={t('faq')}
              hoverable
              showArrow
            />
            {props.client === 'desktop' && props.checkUpdate}
            <ListItem
              icon={<ShareTwoIcon fontSize={iconSize} />}
              onClick={() => setVisible(true)}
              title={t('share_app')}
              hoverable
              showArrow
            />
          </SettingsSection>
          <SettingsSection title={t('vultisig_community')}>
            <ListItem
              icon={<TwitterIcon fontSize={iconSize} />}
              onClick={() => openUrl('https://x.com/vultisig')}
              title={t('twitter')}
              hoverable
              showArrow
            />
            <ListItem
              icon={<DiscordIcon fontSize={iconSize} />}
              onClick={() => openUrl('https://discord.gg/ngvW8tRRfB')}
              title={t('discord')}
              hoverable
              showArrow
            />
            <ListItem
              icon={<GithubIcon fontSize={iconSize} />}
              onClick={() =>
                openUrl('https://github.com/vultisig/vultisig-windows')
              }
              title={t('github')}
              hoverable
              showArrow
            />
          </SettingsSection>
          <SettingsSection title={t('legal')}>
            <ListItem
              icon={<ShieldCheckIcon fontSize={iconSize} />}
              onClick={() => openUrl('https://vultisig.com/privacy')}
              title={t('privacy_policy')}
              hoverable
              showArrow
            />
            <ListItem
              icon={<FileTextIcon fontSize={iconSize} />}
              onClick={() => openUrl('https://vultisig.com/termofservice')}
              title={t('terms_of_service')}
              hoverable
              showArrow
            />
          </SettingsSection>
        </PageContent>
        <PageFooter alignItems="center" gap={8}>
          {props.insiderOptions}
        </PageFooter>
      </VStack>
      {visible && (
        <Modal onClose={() => setVisible(false)} title="Vultisig">
          <VStack gap={24}>
            <VStack gap={14}>
              <Text color="light" size={13} weight={500}>
                {t('share_app')}
              </Text>
              <HStack gap={8} alignItems="center">
                <IconButton
                  onClick={() =>
                    openUrl(
                      `https://linkedin.com/sharing/share-offsite/?url=${shareURL}?utm_source=item-share-linkedin`
                    )
                  }
                  size="lg"
                >
                  <LinkedinIcon fontSize={24} />
                </IconButton>
                <IconButton
                  onClick={() =>
                    openUrl(
                      `https://facebook.com/sharer/sharer.php?u=${shareURL}?utm_source=item-share-facebook`
                    )
                  }
                  size="lg"
                >
                  <FacebookIcon fontSize={24} />
                </IconButton>
                <IconButton
                  onClick={() =>
                    openUrl(
                      `https://reddit.com/submit?url=${shareURL}?utm_source=item-share-reddit`
                    )
                  }
                  size="lg"
                >
                  <RedditIcon fontSize={24} />
                </IconButton>
                <IconButton
                  onClick={() =>
                    openUrl(
                      `https://wa.me/?text=${shareURL}?utm_source=item-share-whatsapp`
                    )
                  }
                  size="lg"
                >
                  <WhatsAppIcon fontSize={24} />
                </IconButton>
                <IconButton
                  onClick={() =>
                    openUrl(
                      `https://twitter.com/intent/tweet?url=${shareURL}?utm_source=item-share-x`
                    )
                  }
                  size="lg"
                >
                  <TwitterIcon fontSize={24} />
                </IconButton>
              </HStack>
            </VStack>
            <HStack gap={8} alignItems="center">
              <Text color="contrast" size={13} weight={500} cropped>
                {shareURL}
              </Text>
              <IconButton onClick={handleCopy}>
                <CopyIcon />
              </IconButton>
            </HStack>
          </VStack>
        </Modal>
      )}
    </>
  )
}
