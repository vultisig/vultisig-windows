import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { CircleDashedIcon } from '@lib/ui/icons/CircleDashedIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { AddFriendsReferralPrompt } from './AddFriendsReferralPrompt'
import { ReferralVaultPanel } from './ReferralVaultPanel'

type Props = {
  onCreateReferral: () => void
  onEditFriendReferral: () => void
}

/** My Referral for a vault with no code of its own: the vault, and the way to create one. */
export const ManageMissingReferral = ({
  onCreateReferral,
  onEditFriendReferral,
}: Props) => {
  const { t } = useTranslation()
  const { colors } = useTheme()

  return (
    <ReferralVaultPanel
      prompt={
        <AddFriendsReferralPrompt
          onUpdateFriendReferral={onEditFriendReferral}
        />
      }
    >
      <NoReferralDescriptionWrapper>
        <VStack alignItems="center" gap={12}>
          <IconWrapper
            size={24}
            style={{ color: colors.primaryAlt.toCssValue() }}
          >
            <CircleDashedIcon />
          </IconWrapper>
          <VStack alignItems="center" gap={8}>
            <SettingsBaselineText centerHorizontally variant="title3">
              {t('no_referral_yet')}
            </SettingsBaselineText>
            <SettingsBaselineText
              centerHorizontally
              color="shy"
              variant="footnote"
            >
              {t('turn_your_vault_into_rewards_machine')}
            </SettingsBaselineText>
          </VStack>
        </VStack>
        <Button icon={<PlusIcon />} onClick={onCreateReferral} size="xs">
          {t('create_referral')}
        </Button>
      </NoReferralDescriptionWrapper>
    </ReferralVaultPanel>
  )
}

const NoReferralDescriptionWrapper = styled(VStack)`
  align-items: center;
  background: ${getColor('foreground')};
  border-radius: ${borderRadiusPx.xl - 4}px;
  gap: 16px;
  padding: 32px 40px;
  position: relative;
`
