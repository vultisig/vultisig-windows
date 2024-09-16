import { ElementType } from 'react';

import AddressBookIcon from '../../lib/ui/icons/AddressBookIcon';
import CurrencyCircleIcon from '../../lib/ui/icons/CurrencyCircleIcon';
import DefaultChainsIcon from '../../lib/ui/icons/DefaultChainsIcon';
import FaqIcon from '../../lib/ui/icons/FaqIcon';
import GlobeIcon from '../../lib/ui/icons/GlobeIcon';
import NoteIcon from '../../lib/ui/icons/NoteIcon';
import SettingsIcon from '../../lib/ui/icons/SettingsIcon';
import ShareIcon from '../../lib/ui/icons/ShareIcon';
import ShieldCheckIcon from '../../lib/ui/icons/ShieldCheckIcon';

export const VULTISIG_GITHUB_LINK =
  'https://github.com/vultisig/vultisig-windows';
export const VULTISIG_TWITTER_LINK = 'https://x.com/vultisig';
export const VULTISIG_DISCORD_LINK = 'https://discord.gg/ngvW8tRRfB';

type SettingItem = {
  id: string;
  titleKey: string;
  icon: ElementType;
  path: string;
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
        icon: SettingsIcon,
        path: '/vault/settings/vault-settings',
      },
      {
        id: 'language',
        titleKey: 'vault_settings_language',
        icon: GlobeIcon,
        path: '/vault/settings/language-settings',
      },
      {
        id: 'currency',
        titleKey: 'vault_settings_currency',
        icon: CurrencyCircleIcon,
        path: '/vault/settings/currency-settings',
      },
      {
        id: 'address-book',
        titleKey: 'vault_settings_address_book',
        icon: AddressBookIcon,
        path: '/vault/settings/address-book',
      },
      {
        id: 'default-chains',
        titleKey: 'vault_settings_default_chains',
        icon: DefaultChainsIcon,
        path: '/vault/settings/default-chains',
      },
      {
        id: 'faq',
        titleKey: 'vault_settings_faq',
        icon: FaqIcon,
        path: '/vault/settings/faq',
      },
    ],
  },
  {
    sectionTitleKey: 'vault_settings_section_other',
    items: [
      {
        id: 'share-app',
        titleKey: 'vault_settings_share_app',
        icon: ShareIcon,
        path: '/vault/settings/share-app',
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
        path: '/vault/settings/privacy-policy',
      },
      {
        id: 'terms-of-service',
        titleKey: 'vault_settings_terms_of_service',
        icon: NoteIcon,
        path: '/vault/settings/terms-of-service',
      },
    ],
  },
];
