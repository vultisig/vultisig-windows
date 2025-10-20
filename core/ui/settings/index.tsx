import { Chain } from '@core/chain/Chain'
import { vult } from '@core/chain/coin/knownTokens'
import { productWebsiteUrl } from '@core/config'
import { ManageBlockaid } from '@core/ui/chain/security/blockaid/ManageBlockaid'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { languageName } from '@core/ui/i18n/Language'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsSection } from '@core/ui/settings/SettingsSection'
import { useCore } from '@core/ui/state/core'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useLanguage } from '@core/ui/storage/language'
import { useHasPasscodeEncryption } from '@core/ui/storage/passcodeEncryption'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { BookMarkedIcon } from '@lib/ui/icons/BookMarkedIcon'
import { CircleDollarSignIcon } from '@lib/ui/icons/CircleDollarSignIcon'
import { CoinsIcon } from '@lib/ui/icons/CoinsIcon'
import { DiscordIcon } from '@lib/ui/icons/DiscordIcon'
import { FileTextIcon } from '@lib/ui/icons/FileTextIcon'
import { GithubIcon } from '@lib/ui/icons/GithubIcon'
import { GlobusIcon } from '@lib/ui/icons/GlobusIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { LanguagesIcon } from '@lib/ui/icons/LanguagesIcon'
import { LockKeyholeIcon } from '@lib/ui/icons/LockKeyholeIcon'
import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { MessageCircleQuestionIcon } from '@lib/ui/icons/MessageCircleQuestionIcon'
import { QrCodeIcon } from '@lib/ui/icons/QrCodeIcon'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { ShareTwoIcon } from '@lib/ui/icons/ShareTwoIcon'
import { ShieldCheckIcon } from '@lib/ui/icons/ShieldCheckIcon'
import { TwitterIcon } from '@lib/ui/icons/TwitterIcon'
import { VultisigLeanLogoIcon } from '@lib/ui/icons/VultisigLeanLogoIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { getColor } from '@lib/ui/theme/getters'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  discordReferralUrl,
  vultisigPrivacyPolicyUrl,
  vultisigTermsOfServiceUrl,
  vultisigTwitterUrl,
  vultisigWindowsGithubUrl,
} from './constants'
import { ShareAppModal } from './share-app/ShareAppModal'

type Props = {
  expandView?: ReactNode
  insiderOptions?: ReactNode
  prioritize?: ReactNode
  checkUpdate?: ReactNode
}

const iconSize = 20

export const SettingsPage: FC<Props> = props => {
  const { t } = useTranslation()
  const { openUrl, client } = useCore()
  const navigate = useCoreNavigate()
  const currency = useFiatCurrency()
  const language = useLanguage()

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
          secondaryControls={
            <IconButton
              kind="action"
              onClick={() => navigate({ id: 'shareVault' })}
            >
              <QrCodeIcon />
            </IconButton>
          }
          title={t('settings')}
          hasBorder
        />
        <PageContent gap={14} flexGrow scrollable>
          <SettingsSection title={t('vault')}>
            {client === 'extension' && props.prioritize}
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <SettingsIcon />
                </ListItemIconWrapper>
              }
              onClick={() => navigate({ id: 'vaultSettings' })}
              title={t('vault_settings')}
              showArrow
            />
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <CoinsIcon />
                </ListItemIconWrapper>
              }
              onClick={() => navigate({ id: 'vultDiscount' })}
              title={`$${vult.ticker} ${t('discount_tiers')}`}
              showArrow
            />
            <PrimaryListItem
              icon={
                <IconWrapper size={iconSize}>
                  <VultisigLeanLogoIcon />
                </IconWrapper>
              }
              onClick={() => navigate({ id: 'airdropRegister' })}
              title={t('register_your_vaults')}
              status="success"
              showArrow
            />
          </SettingsSection>

          <SettingsSection title={t('general')}>
            <ListItem
              extra={languageName[language]}
              icon={
                <ListItemIconWrapper>
                  <LanguagesIcon />
                </ListItemIconWrapper>
              }
              onClick={() => navigate({ id: 'languageSettings' })}
              title={t('language')}
              showArrow
            />
            <ListItem
              extra={currency.toUpperCase()}
              icon={
                <ListItemIconWrapper>
                  <CircleDollarSignIcon />
                </ListItemIconWrapper>
              }
              onClick={() => navigate({ id: 'currencySettings' })}
              title={t('currency')}
              showArrow
            />
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <BookMarkedIcon />
                </ListItemIconWrapper>
              }
              onClick={() => navigate({ id: 'addressBook' })}
              title={t('address_book')}
              showArrow
            />
            {areReferralEnabled && (
              <ListItem
                icon={
                  <ListItemIconWrapper>
                    <MegaphoneIcon />
                  </ListItemIconWrapper>
                }
                onClick={() => navigate({ id: 'referral' })}
                title={t('referral_code')}
                showArrow
              />
            )}
            {client === 'extension' && props.expandView}
          </SettingsSection>
          <SettingsSection title={t('security')}>
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <ShieldCheckIcon />
                </ListItemIconWrapper>
              }
              onClick={() => navigate({ id: 'managePasscodeEncryption' })}
              title={t('security')}
              showArrow
            />
            {hasPasscodeEncryption && (
              <ListItem
                icon={
                  <ListItemIconWrapper>
                    <LockKeyholeIcon />
                  </ListItemIconWrapper>
                }
                onClick={() => navigate({ id: 'passcodeAutoLock' })}
                title={t('lock_time')}
                showArrow
              />
            )}
            <ManageBlockaid />
          </SettingsSection>
          <SettingsSection title={t('support')}>
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <MessageCircleQuestionIcon />
                </ListItemIconWrapper>
              }
              onClick={() => navigate({ id: 'faq' })}
              title={t('faq')}
              showArrow
            />
            {client === 'desktop' && props.checkUpdate}
            <Opener
              renderOpener={({ onOpen }) => (
                <ListItem
                  icon={
                    <ListItemIconWrapper>
                      <ShareTwoIcon />
                    </ListItemIconWrapper>
                  }
                  onClick={onOpen}
                  title={t('share_app')}
                  showArrow
                />
              )}
              renderContent={({ onClose }) => (
                <ShareAppModal onClose={onClose} />
              )}
            />
          </SettingsSection>
          <SettingsSection title={t('vultisig_community')}>
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <TwitterIcon />
                </ListItemIconWrapper>
              }
              onClick={() => openUrl(vultisigTwitterUrl)}
              title={t('twitter')}
              showArrow
            />
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <DiscordIcon />
                </ListItemIconWrapper>
              }
              onClick={() => openUrl(discordReferralUrl)}
              title={t('discord')}
              showArrow
            />
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <GithubIcon />
                </ListItemIconWrapper>
              }
              onClick={() => openUrl(vultisigWindowsGithubUrl)}
              title={t('github')}
              showArrow
            />
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <GlobusIcon />
                </ListItemIconWrapper>
              }
              onClick={() => openUrl(productWebsiteUrl)}
              title={t('vultisig_website')}
              showArrow
            />
          </SettingsSection>
          <SettingsSection title={t('legal')}>
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <ShieldCheckIcon />
                </ListItemIconWrapper>
              }
              onClick={() => openUrl(vultisigPrivacyPolicyUrl)}
              title={t('privacy_policy')}
              showArrow
            />
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <FileTextIcon />
                </ListItemIconWrapper>
              }
              onClick={() => openUrl(vultisigTermsOfServiceUrl)}
              title={t('terms_of_service')}
              showArrow
            />
          </SettingsSection>
        </PageContent>
        <PageFooter alignItems="center" gap={8}>
          {props.insiderOptions}
        </PageFooter>
      </VStack>
    </>
  )
}

const PrimaryListItem = styled(ListItem)`
  background-color: ${getColor('buttonPrimary')};
`

const ListItemIconWrapper = styled(IconWrapper)`
  font-size: 20px;
  color: ${getColor('primaryAlt')};
`
