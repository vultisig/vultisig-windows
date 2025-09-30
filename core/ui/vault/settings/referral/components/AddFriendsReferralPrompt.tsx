import { Image } from '@lib/ui/image/Image'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import { Trans } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

type Props = {
  onUpdateFriendReferral: () => void
}

export const AddFriendsReferralPrompt = ({ onUpdateFriendReferral }: Props) => {
  const {
    colors: { primaryAlt },
  } = useTheme()

  const { t } = useTranslation()

  return (
    <FriendsReferralPromptWrapper
      tabIndex={0}
      role="button"
      onClick={onUpdateFriendReferral}
    >
      <FriendReferralPromptImageWrapper>
        <Image src="/core/images/referral-friend-decoration.png" alt="" />
      </FriendReferralPromptImageWrapper>
      <FriendsReferralPromptOverlay />
      <Text size={12} color="shy">
        <Trans
          i18nKey="save_10_percent_on_swaps"
          components={{
            blue: <span style={{ color: primaryAlt.toCssValue() }} />,
          }}
        />
      </Text>
      <Text size={14}>{t('add_friends_referral')}</Text>
    </FriendsReferralPromptWrapper>
  )
}

const FriendsReferralPromptWrapper = styled(VStack)`
  padding: 24px;
  gap: 4px;
  justify-content: center;
  position: relative;
  overflow: hidden;

  cursor: pointer;

  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
`

const FriendsReferralPromptOverlay = styled.div`
  position: absolute;
  width: 350px;
  height: 350px;
  border-radius: 350px;
  opacity: 0.7;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(4, 57, 199, 0.7) 0%,
    rgba(2, 18, 43, 0) 100%
  );
  filter: blur(36.97182846069336px);
  right: -220px;
  top: -140px;
`

const FriendReferralPromptImageWrapper = styled.div`
  position: absolute;
  right: 0px;
`
