// settingsItems.ts
import { ElementType } from 'react';

import AddressBookIcon from '../../lib/ui/icons/AddressBookIcon';
import CurrencyCircleIcon from '../../lib/ui/icons/CurrencyCircleIcon';
import DefaultChainsIcon from '../../lib/ui/icons/DefaultChainsIcon';
import DownloadIcon from '../../lib/ui/icons/DownloadIcon';
import FaqIcon from '../../lib/ui/icons/FaqIcon';
import GlobeIcon from '../../lib/ui/icons/GlobeIcon';
import NoteIcon from '../../lib/ui/icons/NoteIcon';
import { SettingsIcon } from '../../lib/ui/icons/SettingsIcon';
import ShareIcon from '../../lib/ui/icons/ShareIcon';
import ShieldCheckIcon from '../../lib/ui/icons/ShieldCheckIcon';
import VultisigLogoIcon from '../../lib/ui/icons/VultisigLogoIcon';
import { AppPathsWithNoParamsOrState } from '../../navigation';

export const VULTISIG_WEBSITE_LINK = 'https://vultisig.com';
export const VULTISIG_GITHUB_LINK =
  'https://github.com/vultisig/vultisig-windows';
export const VULTISIG_TWITTER_LINK = 'https://x.com/vultisig';
export const VULTISIG_DISCORD_LINK = 'https://discord.gg/ngvW8tRRfB';
export const VULTISIG_PRIVACY_POLICY_LINK = 'https://vultisig.com/privacy';
export const VULTISIG_TERMS_OF_SERVICE_LINK =
  'https://vultisig.com/termofservice';

export const VULTISIG_GITHUB_RELEASES_LINK =
  'https://github.com/vultisig/vultisig-windows/releases';

export const VULTISIG_SHARE_APP_LINK = 'https://vultisig.com/#store-section';

type SettingItem = {
  id: string;
  titleKey: string;
  icon: ElementType;
  path: AppPathsWithNoParamsOrState;
};

type SettingSection = {
  items: SettingItem[];
  sectionTitleKey?: string;
};

export const settingsItems: SettingSection[] = [
  {
    items: [
      {
        id: 'vault-settings',
        titleKey: 'vault_settings_settings',
        icon: () => <SettingsIcon style={{ fontSize: 24 }} />,
        path: 'editVault',
      },
      {
        id: 'language',
        titleKey: 'vault_settings_language',
        icon: GlobeIcon,
        path: 'languageSettings',
      },
      {
        id: 'currency',
        titleKey: 'vault_settings_currency',
        icon: CurrencyCircleIcon,
        path: 'currencySettings',
      },
      {
        id: 'address-book',
        titleKey: 'vault_settings_address_book',
        icon: AddressBookIcon,
        path: 'addressBook',
      },
      {
        id: 'default-chains',
        titleKey: 'vault_settings_default_chains',
        icon: DefaultChainsIcon,
        path: 'defaultChains',
      },
      {
        id: 'faq',
        titleKey: 'vault_settings_faq',
        icon: FaqIcon,
        path: 'faq',
      },
    ],
  },
  {
    sectionTitleKey: 'vault_settings_section_other',
    items: [
      {
        id: 'register-for-airdrop',
        titleKey: 'vault_settings_register_for_airdrop',
        icon: VultisigLogoIcon,
        path: 'registerForAirdrop',
      },
      {
        id: 'share-app',
        titleKey: 'vault_settings_share_app',
        icon: ShareIcon,
        path: 'shareApp',
      },
      {
        id: 'check-for-update',
        titleKey: 'vault_settings_check_for_update',
        icon: DownloadIcon,
        path: 'checkUpdate',
      },
    ],
  },
  {
    sectionTitleKey: 'vault_settings_section_legal',
    items: [
      {
        id: 'privacy-policy',
        titleKey: 'vault_settings_privacy_policy',
        icon: ShieldCheckIcon,
        path: 'privacyPolicy',
      },
      {
        id: 'terms-of-service',
        titleKey: 'vault_settings_terms_of_service',
        icon: NoteIcon,
        path: 'termsOfService',
      },
    ],
  },
];
