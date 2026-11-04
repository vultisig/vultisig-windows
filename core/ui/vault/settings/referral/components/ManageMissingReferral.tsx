import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { ChevronRightSmallIcon } from '@lib/ui/icons/ChevronRightSmallIcon'
import { CircleDashedIcon } from '@lib/ui/icons/CircleDashedIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { Image } from '@lib/ui/image/Image'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { VaultsPage } from '../../../../vaultsOrganisation'
import { useCurrentVault } from '../../../state/currentVault'
import { AddFriendsReferralPrompt } from './AddFriendsReferralPrompt'
import {
  FixedWrapper,
  Overlay,
  ReferralPageBody,
  ReferralPanel,
  VaultFieldWrapper,
} from './Referrals.styled'

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
  const { name: vaultName } = useCurrentVault()
  const { colors } = useTheme()

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
              <AddFriendsReferralPrompt
                onUpdateFriendReferral={onEditFriendReferral}
              />
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
                <NoReferralDescriptionWrapper>
                  <VStack alignItems="center" gap={12}>
                    <IconWrapper
                      size={24}
                      style={{ color: colors.primaryAlt.toCssValue() }}
                    >
                      <CircleDashedIcon />
                    </IconWrapper>
                    <VStack
                      alignItems="center"
                      gap={8}
                      style={{ position: 'relative', top: 1 }}
                    >
                      <Text centerHorizontally variant="title3">
                        {t('no_referral_yet')}
                      </Text>
                      <Text centerHorizontally color="shy" variant="footnote">
                        {t('turn_your_vault_into_rewards_machine')}
                      </Text>
                    </VStack>
                  </VStack>
                  <Button
                    icon={<PlusIcon />}
                    onClick={onCreateReferral}
                    size="xs"
                  >
                    {t('create_referral')}
                  </Button>
                </NoReferralDescriptionWrapper>
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

const NoReferralDescriptionWrapper = styled(VStack)`
  align-items: center;
  background: ${getColor('foreground')};
  border-radius: ${borderRadiusPx.xl - 4}px;
  gap: 16px;
  padding: 32px 40px;
  position: relative;
`
