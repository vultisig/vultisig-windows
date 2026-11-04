import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useFriendReferralQuery } from '@core/ui/storage/referrals'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { UserSparkleIcon } from '@lib/ui/icons/UserSparkleIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CreateReferralFormProvider } from '../providers/CreateReferralFormProvider'
import { EditReferralFormProvider } from '../providers/EditReferralFormProvider'
import { ReferralPayoutAssetProvider } from '../providers/ReferralPayoutAssetProvider'
import { ValidThorchainNameDetails } from '../services/getUserValidThorchainName'
import { CreateReferralForm } from './CreateReferral/CreateReferralForm'
import { CreateReferralVerify } from './CreateReferral/CreateReferralVerify'
import { EditFriendReferralForm } from './EditFriendReferralForm'
import { EditReferralForm } from './EditReferral/EditReferralForm'
import { EditReferralVerify } from './EditReferral/EditReferralVerify'
import { ManageExistingReferral } from './ManageExistingReferral'
import { ManageMissingReferral } from './ManageMissingReferral'
import { ManageReferralsForm } from './ManageReferralsForm'

type ManageReferralUIState =
  | 'default'
  | 'createReferral'
  | 'editFriendReferral'
  | 'editReferral'
  | 'referralManagement'
  | 'saveReferral'

/** The referral hub: the two entry cards, or the view the user opened from them. */
export const ManageReferrals = ({
  value: validNameDetails = null,
}: Partial<ValueProp<ValidThorchainNameDetails | null>>) => {
  const { t } = useTranslation()
  const [view, setView] = useState<ManageReferralUIState>(
    validNameDetails ? 'referralManagement' : 'default'
  )
  const vaultId = useAssertCurrentVaultId()
  const { data: friendReferral } = useFriendReferralQuery(vaultId)

  return (
    <Match
      value={view}
      default={() => (
        <>
          <SettingsPageHeader
            hasBorder={false}
            title={t('manage_referral_title')}
          />
          <MainContent alignItems="center" scrollable>
            <DiscoveryContent
              fullWidth
              maxWidth={480}
              flexGrow
              justifyContent="space-between"
              gap={8}
            >
              <HeroIllustration src="/core/referral-hero.webp" alt="" />
              <VStack gap={14} fullWidth>
                <ActionItem onClick={() => setView('saveReferral')}>
                  <VStack gap={12}>
                    <HStack alignItems="center" gap={8} wrap="wrap">
                      <Text as={MegaphoneIcon} color="primaryAlt" size={24} />
                      <ActionTitle as="span">{t('save_referral')}</ActionTitle>
                      {Boolean(friendReferral) && (
                        <ActivePill as="span" variant="footnote">
                          {t('active')}
                        </ActivePill>
                      )}
                    </HStack>
                    <ActionDescription as="span" color="shyExtra">
                      <Trans
                        i18nKey="save_referral_desc"
                        components={{
                          c: <Text as="span" color="primaryAlt" size={13} />,
                        }}
                      />
                    </ActionDescription>
                  </VStack>
                  <ChevronRightIcon fontSize={20} />
                </ActionItem>
                <ActionItem onClick={() => setView('createReferral')}>
                  <VStack gap={12}>
                    <HStack alignItems="center" gap={8} wrap="wrap">
                      <Text as={UserSparkleIcon} color="info" size={24} />
                      <ActionTitle as="span">
                        {t('create_referral')}
                      </ActionTitle>
                    </HStack>
                    <ActionDescription as="span" color="shyExtra">
                      <Trans
                        i18nKey="create_referral_desc"
                        components={{
                          c: <Text as="span" color="primaryAlt" size={13} />,
                        }}
                      />
                    </ActionDescription>
                  </VStack>
                  <ChevronRightIcon fontSize={20} />
                </ActionItem>
              </VStack>
            </DiscoveryContent>
          </MainContent>
        </>
      )}
      createReferral={() => (
        <ReferralPayoutAssetProvider>
          <CreateReferralFormProvider>
            <StepTransition
              from={({ onFinish }) => (
                <CreateReferralForm
                  onFinish={onFinish}
                  onBack={() => setView('default')}
                />
              )}
              to={({ onBack }) => <CreateReferralVerify onBack={onBack} />}
            />
          </CreateReferralFormProvider>
        </ReferralPayoutAssetProvider>
      )}
      editFriendReferral={() => (
        <EditFriendReferralForm
          onFinish={() =>
            validNameDetails
              ? setView('referralManagement')
              : setView('default')
          }
        />
      )}
      editReferral={() => (
        <ReferralPayoutAssetProvider>
          <EditReferralFormProvider>
            <StepTransition
              from={({ onFinish }) => (
                <EditReferralForm
                  nameDetails={shouldBePresent(validNameDetails)}
                  onFinish={onFinish}
                  onBack={() => setView('referralManagement')}
                />
              )}
              to={({ onBack }) => <EditReferralVerify onBack={onBack} />}
            />
          </EditReferralFormProvider>
        </ReferralPayoutAssetProvider>
      )}
      referralManagement={() =>
        validNameDetails ? (
          <ManageExistingReferral
            onEditFriendReferral={() => setView('editFriendReferral')}
            onEditReferral={() => setView('editReferral')}
            nameDetails={shouldBePresent(validNameDetails)}
          />
        ) : (
          <ManageMissingReferral
            onCreateReferral={() => setView('createReferral')}
            onEditFriendReferral={() => setView('editFriendReferral')}
          />
        )
      }
      saveReferral={() => (
        <ManageReferralsForm
          onFinish={() => setView('editFriendReferral')}
          onBack={() => setView('default')}
        />
      )}
    />
  )
}

const MainContent = styled(PageContent)`
  padding-top: 9px;
`

const DiscoveryContent = styled(VStack)`
  min-height: 100%;
`

const ActivePill = styled(Text)`
  ${borderRadius.lg};
  background: ${({ theme }) =>
    theme.colors.success.withAlpha(0.05).toCssValue()};
  border: 1px solid ${getColor('success')};
  color: ${getColor('success')};
  padding: 3px 9px;
`

/**
 * Fills whatever height the two action cards leave, cropping the webp's empty
 * margin rather than shrinking the art. It is 375x405, so drawn at the popup's
 * width it alone outgrows the 600px viewport; without `min-height: 0` a flex
 * item never shrinks below its content height and the screen scrolls instead.
 */
const HeroIllustration = styled.img`
  align-self: center;
  display: block;
  flex: 1 1 0;
  max-width: 375px;
  min-height: 0;
  object-fit: cover;
  width: calc(100% + 15px);
`

const ActionTitle = styled(Text)`
  line-height: ${20 / 17};
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.3px;
  position: relative;
  top: 1px;
`

const ActionDescription = styled(Text)`
  line-height: ${18 / 13};
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.06px;
  position: relative;
  top: 1px;
`

const ActionItem = styled(HStack)`
  align-items: center;
  background-color: ${getColor('foreground')};
  ${borderRadius.lg};
  cursor: pointer;
  gap: 24px;
  justify-content: space-between;
  padding: 24px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
