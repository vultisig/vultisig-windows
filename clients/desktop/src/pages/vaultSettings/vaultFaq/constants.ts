import type { TFunction } from 'i18next'

type FaqItem = {
  id: number
  title: string
  content: string
}

export const getFaqData = (t: TFunction): FaqItem[] => [
  {
    id: 1,
    title: t('faq_setup_crypto_vault_title'),
    content: t('faq_setup_crypto_vault_content'),
  },
  {
    id: 2,
    title: t('faq_supported_cryptocurrencies_title'),
    content: t('faq_supported_cryptocurrencies_content'),
  },
  {
    id: 3,
    title: t('faq_secure_crypto_vault_title'),
    content: t('faq_secure_crypto_vault_content'),
  },
  {
    id: 4,
    title: t('faq_vultisig_make_money_title'),
    content: t('faq_vultisig_make_money_content'),
  },
  {
    id: 5,
    title: t('faq_recover_assets_title'),
    content: t('faq_recover_assets_content'),
  },
  {
    id: 6,
    title: t('faq_need_to_register_title'),
    content: t('faq_need_to_register_content'),
  },
]
