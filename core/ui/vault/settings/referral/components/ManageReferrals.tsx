import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useFriendReferralQuery } from '@core/ui/storage/referrals'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { ImageAvatarSparkleIcon } from '@lib/ui/icons/ImageAvatarSparkleIcon'
import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
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
    <ReferralPayoutAssetProvider>
      <Match
        value={view}
        default={() => (
          <>
            <PageHeader
              primaryControls={<PageHeaderBackButton />}
              title={t('manage_referral_title')}
            />
            <PageContent alignItems="center" scrollable>
              <DiscoveryContent
                fullWidth
                maxWidth={480}
                flexGrow
                justifyContent="space-between"
                gap={16}
              >
                <HeroIllustration src="/core/referral-hero.webp" alt="" />
                <VStack gap={14} fullWidth>
                  <ActionItem onClick={() => setView('saveReferral')}>
                    <VStack gap={12}>
                      <HStack alignItems="center" gap={8} wrap="wrap">
                        <Text as={MegaphoneIcon} color="primaryAlt" size={24} />
                        <ActionTitle as="span">
                          {t('save_referral')}
                        </ActionTitle>
                        {Boolean(friendReferral) && (
                          <Text as="span" color="success" size={13}>
                            {t('active')}
                          </Text>
                        )}
                      </HStack>
                      <ActionDescription color="shy" as="span">
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
                        <Text
                          as={ImageAvatarSparkleIcon}
                          color="info"
                          size={24}
                        />
                        <ActionTitle as="span">
                          {t('create_referral')}
                        </ActionTitle>
                      </HStack>
                      <ActionDescription color="shy" as="span">
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
            </PageContent>
          </>
        )}
        createReferral={() => (
          <CreateReferralFormProvider>
            <StepTransition
              from={({ onFinish }) => (
                <CreateReferralForm onFinish={onFinish} />
              )}
              to={({ onBack }) => <CreateReferralVerify onBack={onBack} />}
            />
          </CreateReferralFormProvider>
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
          <EditReferralFormProvider>
            <StepTransition
              from={({ onFinish }) => (
                <EditReferralForm
                  nameDetails={shouldBePresent(validNameDetails)}
                  onFinish={onFinish}
                />
              )}
              to={({ onBack }) => <EditReferralVerify onBack={onBack} />}
            />
          </EditReferralFormProvider>
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
          <ManageReferralsForm onFinish={() => setView('editFriendReferral')} />
        )}
      />
    </ReferralPayoutAssetProvider>
  )
}

const DiscoveryContent = styled(VStack)`
  min-height: 100%;
`

const HeroIllustration = styled.img`
  align-self: center;
  display: block;
  height: auto;
  max-width: 375px;
  width: 100%;
`

const ActionTitle = styled(Text)`
  line-height: ${20 / 17};
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0;
`

const ActionDescription = styled(Text)`
  line-height: ${18 / 13};
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
`

const ActionItem = styled(HStack)`
  align-items: center;
  background-color: ${getColor('foreground')};
  border-radius: 16px;
  cursor: pointer;
  gap: 24px;
  justify-content: space-between;
  padding: 24px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
