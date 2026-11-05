import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsStrongCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CopiesFilledIcon } from '@lib/ui/icons/CopiesFilledIcon'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { Image } from '@lib/ui/image/Image'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled from 'styled-components'

import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'
import { useFriendReferralQuery } from '../../../../storage/referrals'
import { ValidThorchainNameDetails } from '../services/getUserValidThorchainName'
import { formatReferralDateExpiration } from '../utils/formatReferralDateExpiration'
import { AddFriendsReferralPrompt } from './AddFriendsReferralPrompt'
import { FriendReferralSection } from './FriendReferralSection'
import {
  fieldWrapperStyles,
  HorizontalFieldWrapper,
  ReferralFieldIcon,
  VerticalFieldWrapper,
} from './Referrals.styled'
import { ReferralVaultPanel } from './ReferralVaultPanel'

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
  const [, copyToClipboard] = useCopyToClipboard()
  const { t } = useTranslation()
  const vaultId = useAssertCurrentVaultId()
  const { data: friendsReferralCode } = useFriendReferralQuery(vaultId)

  return (
    <ReferralVaultPanel
      prompt={
        !friendsReferralCode && (
          <AddFriendsReferralPrompt
            onUpdateFriendReferral={onEditFriendReferral}
          />
        )
      }
    >
      <RewardsCollectedWrapper>
        <ReferralFieldIcon>
          <TrophyIcon />
        </ReferralFieldIcon>
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
          <ReferralFieldIcon>
            <UnstyledButton onClick={() => copyToClipboard(name)}>
              <CopiesFilledIcon />
            </UnstyledButton>
          </ReferralFieldIcon>
        </HorizontalFieldWrapper>
      </VStack>
      <VerticalFieldWrapper>
        <SettingsBaselineText color="shy" variant="stationBodyS">
          {t('expires_on')}
        </SettingsBaselineText>
        <FieldValue>{formatReferralDateExpiration(expiresOn)}</FieldValue>
      </VerticalFieldWrapper>
      <SettingsStrongCtaButton onClick={onEditReferral}>
        {t('edit_referral')}
      </SettingsStrongCtaButton>
      {friendsReferralCode && (
        <FriendReferralSection
          code={friendsReferralCode}
          onEdit={onEditFriendReferral}
        />
      )}
    </ReferralVaultPanel>
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

const ReferralsThorchainLogoWrapper = styled.div`
  width: 201px;
  height: 206px;

  position: absolute;
  right: -79px;
  top: -23px;
`
