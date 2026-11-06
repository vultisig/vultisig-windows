import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { ArrowUndoIcon } from '@lib/ui/icons/ArrowUndoIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import {
  DecorationLine,
  fieldWrapperStyles,
  ReferralFieldIcon,
  VerticalFieldWrapper,
} from './Referrals.styled'

type FriendReferralSectionProps = {
  code: string
  onEdit: () => void
}

/** The friend's referral code on My Referral, with the way to change it. */
export const FriendReferralSection = ({
  code,
  onEdit,
}: FriendReferralSectionProps) => {
  const { t } = useTranslation()
  const { colors } = useTheme()

  return (
    <VStack gap={14}>
      <DecorationLine />
      <VStack gap={8}>
        <SettingsBaselineText variant="stationBodyS">
          {t('your_friends_referral_code')}
        </SettingsBaselineText>
        <FriendsReferralCode>
          <SettingsBaselineText variant="stationBodyS">
            {code || '--'}
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
        onClick={onEdit}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <VStack
            gap={12}
            style={{
              cursor: 'pointer',
            }}
          >
            <ReferralFieldIcon
              style={{
                color: colors.buttonPrimary.toCssValue(),
              }}
            >
              <ArrowUndoIcon />
            </ReferralFieldIcon>
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
  )
}

const FriendsReferralCode = styled(VStack)`
  ${fieldWrapperStyles};
`
