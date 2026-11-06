import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightSmallIcon } from '@lib/ui/icons/ChevronRightSmallIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Image } from '@lib/ui/image/Image'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { VaultsPage } from '../../../../vaultsOrganisation'
import { useCurrentVault } from '../../../state/currentVault'
import {
  FixedWrapper,
  Overlay,
  ReferralPageBody,
  ReferralPanel,
  VaultFieldWrapper,
} from './Referrals.styled'

type ReferralVaultPanelProps = ChildrenProp & {
  prompt?: ReactNode
}

/** The My Referral page shell: an optional prompt, then a panel opening with the selected vault. */
export const ReferralVaultPanel = ({
  prompt,
  children,
}: ReferralVaultPanelProps) => {
  const { t } = useTranslation()
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
              {prompt}
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
                {children}
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
