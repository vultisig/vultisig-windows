import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ArrowUndoIcon } from '@lib/ui/icons/ArrowUndoIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { Image } from '@lib/ui/image/Image'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled, { useTheme } from 'styled-components'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
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
  ReferralPageWrapper,
  VaultFieldWrapper,
  VerticalFieldWrapper,
} from './Referrals.styled'

type Props = {
  onEditReferral: () => void
  onEditFriendReferral: () => void
  nameDetails?: ValidThorchainNameDetails
}

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
  const navigate = useCoreNavigate()
  const { name: vaultName } = useCurrentVault()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <>
          <PageHeader
            hasBorder
            primaryControls={
              <PageHeaderBackButton
                onClick={() =>
                  navigate({
                    id: 'settings',
                  })
                }
              />
            }
            title={t('your_referrals')}
          />
          <ReferralPageWrapper>
            <AnimatedVisibility
              animationConfig="bottomToTop"
              config={{ duration: 1000 }}
              delay={300}
              overlayStyles={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <Wrapper gap={14}>
                <Overlay />
                {!friendsReferralCode && (
                  <AddFriendsReferralPrompt
                    onUpdateFriendReferral={onEditFriendReferral}
                  />
                )}
                <Text size={14}>{t('vault_selected')}</Text>
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
                    <Text size={16}>{vaultName}</Text>
                  </HStack>
                  <IconWrapper
                    style={{
                      fontSize: 16,
                    }}
                  >
                    <ChevronRightIcon />
                  </IconWrapper>
                </VaultFieldWrapper>

                <RewardsCollectedWrapper>
                  <FieldIconWrapper
                    style={{
                      color: colors.buttonPrimary.toCssValue(),
                    }}
                  >
                    <TrophyIcon />
                  </FieldIconWrapper>
                  <VStack>
                    <Text size={14} color="shy">
                      {t('collected_rewards')}
                    </Text>
                    <Text>
                      {formatAmount(collectedRune, { ticker: 'RUNE' })}
                    </Text>
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
                <Text size={14}>{t('your_referral_code')}</Text>
                <HorizontalFieldWrapper>
                  <Text>{name}</Text>
                  <FieldIconWrapper>
                    <UnstyledButton onClick={() => copyToClipboard(name)}>
                      <CopyIcon />
                    </UnstyledButton>
                  </FieldIconWrapper>
                </HorizontalFieldWrapper>
                <VerticalFieldWrapper gap={10}>
                  <Text size={14} color="shy">
                    {t('expires_on')}
                  </Text>
                  <Text size={18}>
                    {formatReferralDateExpiration(expiresOn)}
                  </Text>
                </VerticalFieldWrapper>
                <Button onClick={onEditReferral}>{t('edit_referral')}</Button>
                <DecorationLine />
                {Boolean(friendsReferralCode) && (
                  <VStack gap={14}>
                    <VStack gap={8}>
                      <Text>{t('your_friends_referral_code')}</Text>
                      <FriendsReferralCode>
                        <Text>{friendsReferralCode || '--'}</Text>
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
                          <Text>{t('change_your_friends_referral')}</Text>
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
              </Wrapper>
            </AnimatedVisibility>
          </ReferralPageWrapper>
        </>
      )}
      renderContent={({ onClose }) => (
        <FixedWrapper>
          <VaultsPage onFinish={onClose} />
        </FixedWrapper>
      )}
    />
  )
}

const Wrapper = styled(VStack)`
  position: relative;

  border: 1px solid ${getColor('foregroundExtra')};
  padding: 14px;
  border-radius: 12px;
  background: rgba(2, 18, 43, 0.5);
`

const RewardsCollectedWrapper = styled(VStack)`
  position: relative;
  overflow: hidden;

  &::before {
    border-radius: 12px;
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

const FieldIconWrapper = styled(IconWrapper)`
  font-size: 20px;
`

const FriendsReferralCode = styled(VStack)`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`

const ReferralsThorchainLogoWrapper = styled.div`
  width: 145px;
  height: 145px;

  position: absolute;
  right: -45px;
  bottom: -45px;
`
