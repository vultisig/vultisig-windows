import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius, borderRadiusPx } from '@lib/ui/css/borderRadius'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import {
  mediaQuery,
  useIsTabletDeviceAndUp,
} from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierMinBalances,
} from '@vultisig/core-chain/swap/affiliate/config'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { settingsBackdropStyles } from '../../../settings/constants'
import { SettingsBaselineText } from '../../../settings/SettingsBaselineText'
import { useCreateCoinMutation } from '../../../storage/coins'
import { useVultBalanceQuery } from '../queries/balance'
import { discountTierColors } from '../tier/colors'
import { discountTierGradients } from '../tier/container'
import { discountTierIcons } from '../tier/icons'

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
const settingsFootnoteHeight = 18 / 13
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
  const LookText = isSettingsLook ? SettingsBaselineText : Text
  const footnoteHeight = isSettingsLook ? settingsFootnoteHeight : undefined

  const TierIcon = discountTierIcons[requiredTier]
  const accent = discountTierColors[requiredTier].toCssValue()
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
          <VStack alignItems="center" gap={32} fullWidth>
            <IconBadge $isSettingsLook={isSettingsLook}>{icon}</IconBadge>
            <VStack
              alignItems="center"
              gap={16}
              padding={isSettingsLook ? '0 12px' : undefined}
            >
              <LookText
                size={22}
                weight={500}
                centerHorizontally
                height={isSettingsLook ? 24 / 22 : undefined}
                letterSpacing={isSettingsLook ? -0.36 : undefined}
              >
                {title}
              </LookText>
              <LookText
                size={14}
                weight={500}
                color="shy"
                centerHorizontally
                height={isSettingsLook ? 20 / 14 : 'large'}
              >
                {description}
              </LookText>
            </VStack>
          </VStack>
          <FooterGroup>
            <RequirementCard $isSettingsLook={isSettingsLook}>
              <LookText
                size={13}
                weight={500}
                color="shy"
                height={footnoteHeight}
              >
                {t('feature_gate_requires')}
              </LookText>
              <HStack alignItems="center" gap={12}>
                <TierIcon
                  fontSize={36}
                  style={isSettingsLook ? { flexShrink: 0 } : undefined}
                />
                <VStack
                  gap={2}
                  padding={isSettingsLook ? '2px 0 0' : undefined}
                >
                  <LookText
                    size={14}
                    weight={500}
                    height={isSettingsLook ? 20 / 14 : undefined}
                  >
                    {t('feature_gate_requires_tier', {
                      tier: t(requiredTier),
                    })}
                  </LookText>
                  <LookText
                    size={13}
                    weight={500}
                    color="shy"
                    height={footnoteHeight}
                  >
                    {t('feature_gate_hold_at_least', {
                      amount: formatAmount(
                        vultDiscountTierMinBalances[requiredTier],
                        { ticker: vult.ticker }
                      ),
                    })}
                  </LookText>
                </VStack>
              </HStack>
              <BalanceRow $isSettingsLook={isSettingsLook}>
                <HStack alignItems="center" gap={6}>
                  <IconWrapper>
                    <WalletIcon />
                  </IconWrapper>
                  <LookText
                    size={13}
                    weight={500}
                    color="shy"
                    height={footnoteHeight}
                  >
                    {t('feature_gate_your_balance')}
                  </LookText>
                </HStack>
                <LookText
                  size={13}
                  weight={500}
                  height={footnoteHeight}
                  style={{ color: accent }}
                >
                  {formatAmount(balanceQuery.data ?? 0, {
                    ticker: vult.ticker,
                  })}
                </LookText>
              </BalanceRow>
            </RequirementCard>
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

const IconBadge = styled.div<{ $isSettingsLook: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  ${borderRadius.pill};
  background: #03132c;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 18px rgba(12, 78, 255, 0.18);
  font-size: 20px;
  color: #0439c7;

  ${({ $isSettingsLook }) =>
    $isSettingsLook &&
    css`
      background: ${getColor('settingsBadgeBackground')};
      box-shadow: inset 0 2px 1px rgba(0, 0, 0, 0.25);
      color: ${getColor('buttonNeutral')};
      overflow: hidden;
      position: relative;

      &::after {
        background: ${getColor('buttonPrimary')};
        bottom: -3px;
        content: '';
        filter: blur(9.26px);
        height: 8px;
        left: 11.8px;
        position: absolute;
        width: 15.9px;
      }
    `}
`

const IconWrapper = styled.div`
  display: inline-flex;
  font-size: 16px;
  color: ${getColor('textShy')};
`

const FooterGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
`

const RequirementCard = styled(VStack)<{ $isSettingsLook: boolean }>`
  position: relative;
  z-index: 1;
  align-self: stretch;
  gap: 12px;
  padding: 24px 20px 16px;
  ${borderRadius.xl};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};

  ${({ $isSettingsLook }) =>
    $isSettingsLook &&
    css`
      border-radius: ${borderRadiusPx.xl}px ${borderRadiusPx.xl}px 20px 20px;
      padding: 23px 19px 15px;
    `}
`

// eslint-disable-next-line local/no-hardcoded-border-radius -- the sheet component's own radius, off the scale
const BalanceRow = styled(HStack)<{ $isSettingsLook: boolean }>`
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  gap: 12px;
  padding: 16px;
  ${borderRadius.lg};
  background: #0d2240;
  border: 1px solid ${getColor('foregroundExtra')};

  > * {
    min-width: 0;
  }

  ${({ $isSettingsLook }) =>
    $isSettingsLook &&
    css`
      background: ${getColor('settingsRaisedSurface')};
      border-radius: 14px;
      margin-top: 12px;
      padding: 15px;
    `}
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
