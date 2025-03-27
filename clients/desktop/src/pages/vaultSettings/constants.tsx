// settingsItems.ts
import { TFunction } from 'i18next'
import { ElementType } from 'react'

import AddressBookIcon from '../../lib/ui/icons/AddressBookIcon'
import CurrencyCircleIcon from '../../lib/ui/icons/CurrencyCircleIcon'
import DefaultChainsIcon from '../../lib/ui/icons/DefaultChainsIcon'
import DownloadIcon from '../../lib/ui/icons/DownloadIcon'
import FaqIcon from '../../lib/ui/icons/FaqIcon'
import GlobeIcon from '../../lib/ui/icons/GlobeIcon'
import NoteIcon from '../../lib/ui/icons/NoteIcon'
import { SettingsIcon } from '../../lib/ui/icons/SettingsIcon'
import ShareIcon from '../../lib/ui/icons/ShareIcon'
import ShieldCheckIcon from '../../lib/ui/icons/ShieldCheckIcon'
import VultisigLogoIcon from '../../lib/ui/icons/VultisigLogoIcon'
import { AppPathsWithNoParamsOrState } from '../../navigation'

export const VULTISIG_WEBSITE_LINK = 'https://vultisig.com'
export const VULTISIG_GITHUB_LINK =
  'https://github.com/vultisig/vultisig-windows'
export const VULTISIG_TWITTER_LINK = 'https://x.com/vultisig'
export const VULTISIG_DISCORD_LINK = 'https://discord.gg/ngvW8tRRfB'
export const VULTISIG_PRIVACY_POLICY_LINK = 'https://vultisig.com/privacy'
export const VULTISIG_TERMS_OF_SERVICE_LINK =
  'https://vultisig.com/termofservice'

export const DOWNLOAD_VULTISIG_LINK = 'https://vultisig.com/download/vultisig'

export const VULTISIG_SHARE_APP_LINK = 'https://vultisig.com/#store-section'

type TranslatedSettingItem = {
  id: string
  title: string
  icon: ElementType
  path: AppPathsWithNoParamsOrState
}

type TranslatedSettingSection = {
  items: TranslatedSettingItem[]
  sectionTitle?: string
}

export const getTranslatedSettingsItems = (
  t: TFunction
): TranslatedSettingSection[] => {
  return [
    {
      items: [
        {
          id: 'vault-settings',
          title: t('settings'),
          icon: () => <SettingsIcon style={{ fontSize: 24 }} />,
          path: 'editVault',
        },
        {
          id: 'language',
          title: t('language'),
          icon: GlobeIcon,
          path: 'languageSettings',
        },
        {
          id: 'currency',
          title: t('currency'),
          icon: CurrencyCircleIcon,
          path: 'currencySettings',
        },
        {
          id: 'address-book',
          title: t('vault_settings_address_book'),
          icon: AddressBookIcon,
          path: 'addressBook',
        },
        {
          id: 'default-chains',
          title: t('vault_settings_default_chains'),
          icon: DefaultChainsIcon,
          path: 'defaultChains',
        },
        {
          id: 'faq',
          title: t('faq'),
          icon: FaqIcon,
          path: 'faq',
        },
      ],
    },
    {
      sectionTitle: t('other'),
      items: [
        {
          id: 'register-for-airdrop',
          title: t('vault_settings_register_for_airdrop'),
          icon: VultisigLogoIcon,
          path: 'registerForAirdrop',
        },
        {
          id: 'share-app',
          title: t('vault_settings_share_app'),
          icon: ShareIcon,
          path: 'shareApp',
        },
        {
          id: 'check-for-update',
          title: t('vault_settings_check_for_update'),
          icon: () => <DownloadIcon stroke="white" />,
          path: 'checkUpdate',
        },
      ],
    },
    {
      sectionTitle: t('vault_settings_section_legal'),
      items: [
        {
          id: 'privacy-policy',
          title: t('vault_settings_privacy_policy'),
          icon: ShieldCheckIcon,
          path: 'privacyPolicy',
        },
        {
          id: 'terms-of-service',
          title: t('vault_settings_terms_of_service'),
          icon: NoteIcon,
          path: 'termsOfService',
        },
      ],
    },
  ]
}
