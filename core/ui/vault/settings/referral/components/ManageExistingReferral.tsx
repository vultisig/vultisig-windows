import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsStrongCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { Opener } from '@lib/ui/base/Opener'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ArrowUndoIcon } from '@lib/ui/icons/ArrowUndoIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { ChevronRightSmallIcon } from '@lib/ui/icons/ChevronRightSmallIcon'
import { CopiesFilledIcon } from '@lib/ui/icons/CopiesFilledIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { Image } from '@lib/ui/image/Image'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled, { useTheme } from 'styled-components'

import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'
import { useFriendReferralQuery } from '../../../../storage/referrals'
import { VaultsPage } from '../../../../vaultsOrganisation'
import { useCurrentVault } from '../../../state/currentVault'
import { ValidThorchainNameDetails } from '../services/getUserValidThorchainName'
import { formatReferralDateExpiration } from '../utils/formatReferralDateExpiration'
import { AddFriendsReferralPrompt } from './AddFriendsReferralPrompt'
import {
  DecorationLine,
  fieldWrapperStyles,
  FixedWrapper,
  HorizontalFieldWrapper,
  Overlay,
  ReferralPageBody,
  ReferralPanel,
  VaultFieldWrapper,
  VerticalFieldWrapper,
} from './Referrals.styled'

type Props = {
  onEditReferral: () => void
  onEditFriendReferral: () => void
  nameDetails?: ValidThorchainNameDetails
}

/** My Referral for a vault with a code: rewards, the code, its expiry and the way to edit it. */
export const ManageExistingReferral = ({
  nameDetails: {
    name,
    collectedRune,
    expiresOn,
  } = {} as ValidThorchainNameDetails,
  onEditFriendReferral,
  onEditReferral,
}: Props) => {
  const { colors } = useTheme()
  const [, copyToClipboard] = useCopyToClipboard()
  const { t } = useTranslation()
  const vaultId = useAssertCurrentVaultId()
  const { data: friendsReferralCode } = useFriendReferralQuery(vaultId)
  const { name: vaultName } = useCurrentVault()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <>
          <SettingsPageHeader title={t('your_referrals')} />
          <ReferralPageBody>
            <AnimatedVisibility
              animationConfig="bottomToTop"
              config={{ duration: 1000 }}
              delay={300}
              overlayStyles={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {!friendsReferralCode && (
                <AddFriendsReferralPrompt
                  onUpdateFriendReferral={onEditFriendReferral}
                />
              )}
              <ReferralPanel>
                <Overlay />
                <SettingsBaselineText variant="stationBodyS">
                  {t('vault_selected')}
                </SettingsBaselineText>
                <VaultFieldWrapper onClick={onOpen}>
                  <HStack alignItems="center" gap={10}>
                    <Image
                      style={{
                        objectFit: 'contain',
                      }}
                      src="/core/images/vault-image-placeholder.png"
                      alt=""
                      width={28}
                      height={28}
                    />
                    <Text height={1} size={16} weight={400}>
                      {vaultName}
                    </Text>
                  </HStack>
                  <IconWrapper size={16}>
                    <ChevronRightSmallIcon />
                  </IconWrapper>
                </VaultFieldWrapper>

                <RewardsCollectedWrapper>
                  <FieldIconWrapper>
                    <TrophyIcon />
                  </FieldIconWrapper>
                  <VStack>
                    <SettingsBaselineText color="shy" variant="stationBodyS">
                      {t('collected_rewards')}
                    </SettingsBaselineText>
                    <FieldValue>
                      {formatAmount(collectedRune, { ticker: 'RUNE' })}
                    </FieldValue>
                  </VStack>
                  <ReferralsThorchainLogoWrapper>
                    <Image
                      src="/core/images/referrals-thorchain-logo.png"
                      style={{
                        objectFit: 'contain',
                        width: '100%',
                        height: '100%',
                      }}
                      alt=""
                    />
                  </ReferralsThorchainLogoWrapper>
                </RewardsCollectedWrapper>
                <VStack gap={8}>
                  <SettingsBaselineText color="shy" variant="stationBodyS">
                    {t('your_referral_code')}
                  </SettingsBaselineText>
                  <HorizontalFieldWrapper>
                    <SettingsBaselineText variant="stationBodyS">
                      {name}
                    </SettingsBaselineText>
                    <FieldIconWrapper>
                      <UnstyledButton onClick={() => copyToClipboard(name)}>
                        <CopiesFilledIcon />
                      </UnstyledButton>
                    </FieldIconWrapper>
                  </HorizontalFieldWrapper>
                </VStack>
                <VerticalFieldWrapper>
                  <SettingsBaselineText color="shy" variant="stationBodyS">
                    {t('expires_on')}
                  </SettingsBaselineText>
                  <FieldValue>
                    {formatReferralDateExpiration(expiresOn)}
                  </FieldValue>
                </VerticalFieldWrapper>
                <SettingsStrongCtaButton onClick={onEditReferral}>
                  {t('edit_referral')}
                </SettingsStrongCtaButton>
                {Boolean(friendsReferralCode) && (
                  <VStack gap={14}>
                    <DecorationLine />
                    <VStack gap={8}>
                      <SettingsBaselineText variant="stationBodyS">
                        {t('your_friends_referral_code')}
                      </SettingsBaselineText>
                      <FriendsReferralCode>
                        <SettingsBaselineText variant="stationBodyS">
                          {friendsReferralCode || '--'}
                        </SettingsBaselineText>
                      </FriendsReferralCode>
                    </VStack>
                    <DecorationLine />
                    <VerticalFieldWrapper
                      style={{
                        cursor: 'pointer',
                      }}
                      tabIndex={0}
                      role="button"
                      onClick={onEditFriendReferral}
                    >
                      <HStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <VStack
                          gap={12}
                          style={{
                            cursor: 'pointer',
                          }}
                        >
                          <FieldIconWrapper
                            style={{
                              color: colors.buttonPrimary.toCssValue(),
                            }}
                          >
                            <ArrowUndoIcon />
                          </FieldIconWrapper>
                          <SettingsBaselineText variant="stationBodyS">
                            {t('change_your_friends_referral')}
                          </SettingsBaselineText>
                        </VStack>
                        <IconWrapper
                          style={{
                            fontSize: 24,
                          }}
                        >
                          <ChevronRightIcon />
                        </IconWrapper>
                      </HStack>
                    </VerticalFieldWrapper>
                  </VStack>
                )}
              </ReferralPanel>
            </AnimatedVisibility>
          </ReferralPageBody>
        </>
      )}
      renderContent={({ onClose }) => (
        <FixedWrapper>
          <VaultsPage isSettingsLook onFinish={onClose} />
        </FixedWrapper>
      )}
    />
  )
}

const RewardsCollectedWrapper = styled(VStack)`
  position: relative;
  overflow: hidden;

  &::before {
    ${borderRadius.md};
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        421.89% 235.59% at -14.2% -60.19%,
        rgba(52, 230, 191, 0.12) 0%,
        rgba(0, 0, 0, 0) 60%
      ),
      #02122b;

    z-index: -1;
  }

  ${fieldWrapperStyles};
  gap: 12px;
  height: 108px;
`

const FieldValue = styled(Text)`
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.09px;
  line-height: 28px;
`

const FieldIconWrapper = styled(IconWrapper)`
  font-size: 20px;
`

const FriendsReferralCode = styled(VStack)`
  ${fieldWrapperStyles};
`

const ReferralsThorchainLogoWrapper = styled.div`
  width: 201px;
  height: 206px;

  position: absolute;
  right: -79px;
  top: -23px;
`
