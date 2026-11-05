import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius, borderRadiusPx } from '@lib/ui/css/borderRadius'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import {
  mediaQuery,
  useIsTabletDeviceAndUp,
} from '@lib/ui/responsive/mediaQuery'
import { getColor } from '@lib/ui/theme/getters'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { settingsBackdropStyles } from '../../../settings/constants'
import { useCreateCoinMutation } from '../../../storage/coins'
import { useVultBalanceQuery } from '../queries/balance'
import { discountTierGradients } from '../tier/container'
import { FeatureTierGateHeading } from './FeatureTierGateHeading'
import { FeatureTierGateRequirement } from './FeatureTierGateRequirement'

type FeatureTierGateProps = {
  isOpen: boolean
  onClose: () => void
  /** Icon for the gated feature, rendered inside the header badge. */
  icon: ReactNode
  /** Name of the gated feature. */
  title: string
  /** Short explanation of the gated feature. */
  description: string
  /** Minimum tier (and VULT threshold) the feature requires. */
  requiredTier: VultDiscountTier
  /** Draws the sheet from the settings frames. */
  isSettingsLook?: boolean
}

// eslint-disable-next-line local/no-hardcoded-border-radius -- the sheet component's own radius, off the scale
const settingsDrawerStyles = { borderRadius: '38px 38px 0 0' }
// The drawer's grabber row takes 28 of the frame's 54 above the badge.
const settingsDrawerPadding = '26px 16px 24px'
const settingsModalPadding = '40px 16px 24px'

/**
 * Reusable responsive prompt shown when a tier-locked feature is tapped without
 * the required VULT tier. Parameterised by the gated feature (icon/title/description)
 * and the required tier; shows the threshold, the vault's VULT balance, and a
 * "Get $VULT" CTA that routes to the swap with VULT preselected.
 */
export const FeatureTierGate = ({
  isOpen,
  onClose,
  icon,
  title,
  description,
  requiredTier,
  isSettingsLook = false,
}: FeatureTierGateProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { mutate: createCoin, isPending } = useCreateCoinMutation()
  const balanceQuery = useVultBalanceQuery()
  const isTabletAndUp = useIsTabletDeviceAndUp()

  const dialogLabel = typeof title === 'string' ? title : undefined

  if (!isOpen) return null

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      grabbable
      mobileFullWidth
      modalProps={{ withDefaultStructure: false }}
      drawerStyles={isSettingsLook ? settingsDrawerStyles : undefined}
      backdropStyles={isSettingsLook ? settingsBackdropStyles : undefined}
    >
      <DialogFrame
        $isSettingsLook={isSettingsLook}
        role="dialog"
        aria-modal
        aria-label={dialogLabel}
      >
        <VStack
          alignItems="center"
          gap={20}
          padding={
            !isSettingsLook
              ? '40px 15px 16px'
              : isTabletAndUp
                ? settingsModalPadding
                : settingsDrawerPadding
          }
        >
          <FeatureTierGateHeading
            icon={icon}
            title={title}
            description={description}
            isSettingsLook={isSettingsLook}
          />
          <FooterGroup>
            <FeatureTierGateRequirement
              requiredTier={requiredTier}
              balance={balanceQuery.data ?? 0}
              isSettingsLook={isSettingsLook}
            />
            <GetVultButton
              $gradient={discountTierGradients[requiredTier]}
              $isSettingsLook={isSettingsLook}
              disabled={isPending}
              onClick={() =>
                createCoin(vult, {
                  onSuccess: coin => {
                    navigate({
                      id: 'swap',
                      state: { toCoin: extractCoinKey(coin) },
                    })
                  },
                })
              }
            >
              {isPending ? <Spinner /> : t('get_vult')}
            </GetVultButton>
          </FooterGroup>
        </VStack>
      </DialogFrame>
    </ResponsiveModal>
  )
}

const DialogFrame = styled.div<{ $isSettingsLook: boolean }>`
  width: 100%;
  height: min(627px, calc(100vh - 48px));
  min-height: 0;
  background: ${getColor('background')};
  overflow-y: auto;

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: min(480px, calc(100vw - 32px));
    height: auto;
    max-height: calc(100vh - 80px);
    border: 1px solid ${getColor('mistExtra')};
    ${borderRadius.xl};
    box-shadow: 0 15px 75px rgba(0, 0, 0, 0.18);
  }

  ${({ $isSettingsLook }) =>
    $isSettingsLook &&
    css`
      height: auto;
    `}
`

const FooterGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
`

const GetVultButton = styled(UnstyledButton)<{
  $gradient: string
  $isSettingsLook: boolean
}>`
  position: relative;
  z-index: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  align-self: stretch;
  margin-top: -22px;
  padding: 32px 32px 14px;
  border-radius: 0 0 ${borderRadiusPx.xl}px ${borderRadiusPx.xl}px;
  background: ${({ $gradient }) => $gradient};
  color: #f0f4fc;
  font-size: 14px;
  font-weight: 600;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  ${({ $isSettingsLook }) =>
    $isSettingsLook &&
    css`
      line-height: 18px;
      padding: 38px 32px 17px;
    `}
`
