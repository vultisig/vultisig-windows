import { ManageBlockaid } from '@core/ui/chain/security/blockaid/ManageBlockaid'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { languageName } from '@core/ui/i18n/Language'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsSection } from '@core/ui/settings/SettingsSection'
import { useCore } from '@core/ui/state/core'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useLanguage } from '@core/ui/storage/language'
import { TokenApprovalsSettingsRow } from '@core/ui/vault/settings/advanced/tokenApprovals/TokenApprovalsSettingsRow'
import { BellFilledIcon } from '@lib/ui/icons/BellFilledIcon'
import { BookBookmarkFilledIcon } from '@lib/ui/icons/BookBookmarkFilledIcon'
import { CardsFilledIcon } from '@lib/ui/icons/CardsFilledIcon'
import { CircleDollarSignIcon } from '@lib/ui/icons/CircleDollarSignIcon'
import { LanguagesIcon } from '@lib/ui/icons/LanguagesIcon'
import { NoteIcon } from '@lib/ui/icons/NoteIcon'
import { ShieldFilledIcon } from '@lib/ui/icons/ShieldFilledIcon'
import { ShieldOutlineIcon } from '@lib/ui/icons/ShieldOutlineIcon'
import { SlidersHorizontalIcon } from '@lib/ui/icons/SlidersHorizontalIcon'
import { SquareQuestionFilledIcon } from '@lib/ui/icons/SquareQuestionFilledIcon'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigation } from '@lib/ui/navigation/state'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { currentProductBrand } from '../product/brand'
import {
  currentProductEducationUrl,
  shouldShowVultisigCommunity,
  vultisigPrivacyPolicyUrl,
  vultisigTermsOfServiceUrl,
} from './constants'
import { SettingsCommunity } from './SettingsCommunity'
import { SettingsItem } from './SettingsItem'
import { ShareAppSettingsItem } from './ShareAppSettingsItem'

type SettingsPageProps = {
  expandView?: ReactNode
  insiderOptions?: ReactNode
  prioritize?: ReactNode
  sidePanel?: ReactNode
  stationMigration?: ReactNode
  checkUpdate?: ReactNode
}

/** The app settings list; each client slots in its own rows. */
export const SettingsPage = ({
  expandView,
  insiderOptions,
  prioritize,
  sidePanel,
  stationMigration,
  checkUpdate,
}: SettingsPageProps) => {
  const { t } = useTranslation()
  const { openUrl, client, goBack } = useCore()
  const [{ history }] = useNavigation()
  const navigate = useCoreNavigate()
  const currency = useFiatCurrency()
  const language = useLanguage()

  const shouldShowVultDiscounts = currentProductBrand === 'vultisig'

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={() => {
              if (history.length > 1) {
                goBack()
              } else {
                navigate({ id: 'vault' }, { replace: true })
              }
            }}
          />
        }
        title={t('settings')}
        hasBorder
      />
      <Content gap={13} flexGrow scrollable>
        <VStack gap={14}>
          {client === 'extension' && (
            <SettingsSection title={t('quick_settings')}>
              {prioritize}
              <ManageBlockaid />
              {sidePanel}
              {expandView}
            </SettingsSection>
          )}
          <SettingsSection title={t('vault')}>
            <SettingsItem
              icon={<SlidersHorizontalIcon />}
              onClick={() => navigate({ id: 'vaultSettings' })}
              title={t('vault_settings')}
            />
            {shouldShowVultDiscounts && (
              <SettingsItem
                icon={<CardsFilledIcon />}
                onClick={() => navigate({ id: 'vultDiscount' })}
                title={t('discount_tiers', { ticker: `$${vult.ticker}` })}
              />
            )}
            <SettingsItem
              icon={<ShieldFilledIcon />}
              onClick={() => navigate({ id: 'managePasscodeEncryption' })}
              title={t('security')}
            />
            {client === 'extension' && stationMigration}
          </SettingsSection>
          <SettingsSection title={t('general')}>
            <SettingsItem
              data-testid="notifications-settings-link"
              icon={<BellFilledIcon />}
              onClick={() => navigate({ id: 'notificationSettings' })}
              title={t('notifications')}
            />
            <SettingsItem
              icon={<LanguagesIcon />}
              onClick={() => navigate({ id: 'languageSettings' })}
              title={t('language')}
              value={languageName[language]}
            />
            <SettingsItem
              icon={<CircleDollarSignIcon />}
              onClick={() => navigate({ id: 'currencySettings' })}
              title={t('currency')}
              value={currency.toUpperCase()}
            />
            <SettingsItem
              data-testid="home-display-settings-link"
              icon={<WalletIcon />}
              onClick={() => navigate({ id: 'homeDisplaySettings' })}
              title={t('home_display')}
            />
            <SettingsItem
              data-testid="address-book-link"
              icon={<BookBookmarkFilledIcon />}
              onClick={() => navigate({ id: 'addressBook' })}
              title={t('address_book')}
            />
            <TokenApprovalsSettingsRow />
          </SettingsSection>
          {shouldShowVultisigCommunity && <SettingsCommunity />}
          <SettingsSection title={t('support')}>
            <SettingsItem
              icon={<SquareQuestionFilledIcon />}
              onClick={() => navigate({ id: 'faq' })}
              title={t('faq')}
            />
            {client === 'desktop' && checkUpdate}
            <SettingsItem
              icon={<BookBookmarkFilledIcon />}
              onClick={() => openUrl(currentProductEducationUrl)}
              title={t('vultisig_education')}
            />
            {!shouldShowVultisigCommunity && <ShareAppSettingsItem />}
          </SettingsSection>
          <SettingsSection title={t('legal')}>
            <SettingsItem
              chevron="large"
              icon={<ShieldOutlineIcon />}
              onClick={() => openUrl(vultisigPrivacyPolicyUrl)}
              title={t('privacy_policy')}
            />
            <SettingsItem
              chevron="large"
              icon={<NoteIcon />}
              onClick={() => openUrl(vultisigTermsOfServiceUrl)}
              title={t('terms_of_service')}
            />
          </SettingsSection>
        </VStack>
        <VStack alignItems="center">{insiderOptions}</VStack>
      </Content>
    </VStack>
  )
}

const Content = styled(PageContent)`
  padding-top: 24px;
`
