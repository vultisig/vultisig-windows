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
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatDateWithOf } from '@lib/utils/date/formatDateWithOf'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled, { useTheme } from 'styled-components'

import { ReferralDashboard } from '../services/getReferralDashboard'
import { DecorationLine, ReferralPageWrapper } from './Referrals.styled'

type Props = {
  onEditReferral: () => void
  onEditFriendReferral: () => void
  referralDashboardData?: ReferralDashboard
}

export const ManageExistingReferral = ({
  referralDashboardData: {
    name,
    collectedRune,
    expiresOn,
  } = {} as ReferralDashboard,
  onEditFriendReferral,
  onEditReferral,
}: Props) => {
  const { colors } = useTheme()
  const [, copyToClipboard] = useCopyToClipboard()
  const { t } = useTranslation()

  // get somehow friends referral code from local storage
  const friendsReferralCode = 'MMCK'

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
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
            <Text size={14}>Your Referral Code</Text>
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
                Collected rewards
              </Text>
              <Text>{formatTokenAmount(collectedRune, 'RUNE')}</Text>
            </VStack>
          </FieldWrapper>
          <FieldWrapper>
            <Text size={14} color="shy">
              Collected rewards
            </Text>
            <Text>{formatDateWithOf(expiresOn)}</Text>
          </FieldWrapper>
          <Button onClick={onEditReferral}>Edit Referral</Button>
          <DecorationLine />
          {friendsReferralCode && (
            <VStack gap={14}>
              <VStack gap={8}>
                <Text>Your friends referral code</Text>
                <FriendsReferralCode>
                  <Text>{friendsReferralCode}</Text>
                </FriendsReferralCode>
              </VStack>
              <DecorationLine />
              <FieldWrapper>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack gap={12}>
                    <FieldIconWrapper
                      style={{
                        color: colors.buttonPrimary.toCssValue(),
                      }}
                    >
                      <ArrowUndoIcon />
                    </FieldIconWrapper>
                    <Text>Change friends Referral Code used for swaps</Text>
                  </VStack>
                  <IconWrapper
                    style={{
                      fontSize: 24,
                    }}
                  >
                    <UnstyledButton onClick={onEditFriendReferral}>
                      <ChevronRightIcon />
                    </UnstyledButton>
                  </IconWrapper>
                </HStack>
              </FieldWrapper>
            </VStack>
          )}
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
