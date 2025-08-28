import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ArrowUndoIcon } from '@lib/ui/icons/ArrowUndoIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled, { useTheme } from 'styled-components'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'
import { useFriendReferralQuery } from '../../../../storage/referrals'
import { ValidThorchainNameDetails } from '../services/getUserValidThorchainName'
import { formatReferralDateExpiration } from '../utils/formatReferralDateExpiration'
import { DecorationLine, ReferralPageWrapper } from './Referrals.styled'

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

  return (
    <>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={() =>
              navigate({
                id: 'settings',
              })
            }
          />
        }
        title={t('title_1')}
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
          <VStack gap={8}>
            <Text size={14}>{t('your_referral_code')}</Text>
            <FieldWrapper
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text>{name}</Text>
              <FieldIconWrapper>
                <UnstyledButton onClick={() => copyToClipboard(name)}>
                  <CopyIcon />
                </UnstyledButton>
              </FieldIconWrapper>
            </FieldWrapper>
          </VStack>
          <FieldWrapper
            style={{
              gap: 12,
            }}
          >
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
              <Text>{formatTokenAmount(collectedRune, 'RUNE')}</Text>
            </VStack>
          </FieldWrapper>
          <FieldWrapper gap={10}>
            <Text size={14} color="shy">
              {t('expires_on')}
            </Text>
            <Text size={18}>{formatReferralDateExpiration(expiresOn)}</Text>
          </FieldWrapper>
          <Button onClick={onEditReferral}>{t('edit_referral')}</Button>
          <DecorationLine />
          <VStack gap={14}>
            <VStack gap={8}>
              <Text>{t('your_friends_referral_code')}</Text>
              <FriendsReferralCode>
                <Text>{friendsReferralCode || '--'}</Text>
              </FriendsReferralCode>
            </VStack>
            <DecorationLine />
            <FieldWrapper
              style={{
                cursor: 'ponter',
              }}
              tabIndex={0}
              role="button"
              onClick={onEditFriendReferral}
            >
              <HStack justifyContent="space-between" alignItems="center">
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
            </FieldWrapper>
          </VStack>
        </AnimatedVisibility>
      </ReferralPageWrapper>
    </>
  )
}

const FieldWrapper = styled(VStack)`
  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
  padding: 14px;
`

const FieldIconWrapper = styled(IconWrapper)`
  font-size: 20px;
`

const FriendsReferralCode = styled(VStack)`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`
