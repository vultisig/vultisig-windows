import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useHandleVaultChainItemPress } from '@core/ui/vault/page/components/useHandleVaultChainItemPress'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SquareBehindSquare6Icon } from '@lib/ui/icons/SquareBehindSquare6Icon'
import { StationChevronRightSmallIcon } from '@lib/ui/icons/StationFigmaIcons'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { Chain } from '@vultisig/core-chain/Chain'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { attempt } from '@vultisig/lib-utils/attempt'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

type VaultChainItemProps = {
  chain: Chain
} & ChildrenProp

/**
 * Portfolio row for one chain: logo, name, copyable address and navigation to
 * the chain page. `children` fills the balance slot on the right, so the row
 * looks the same whether the chain's balances resolved or failed to load.
 */
export const VaultChainItem = ({ chain, children }: VaultChainItemProps) => {
  const addresses = useCurrentVaultAddresses()
  const address = shouldBePresent(
    addresses[chain],
    `Vault address missing for chain ${chain}`
  )

  const pressHandlers = useHandleVaultChainItemPress({
    chain,
  })

  const { t } = useTranslation()
  const { addToast } = useToast()
  const { iconStyle } = useTheme()

  const handleCopyAddress = async (
    e: React.MouseEvent | React.KeyboardEvent
  ) => {
    e.stopPropagation()
    e.preventDefault()

    const result = await attempt(() => navigator.clipboard.writeText(address))

    if ('error' in result) {
      addToast({
        message: t('failed_to_copy_address'),
        status: 'error',
      })

      return
    }

    addToast({
      message: t('chain_address_copied', { chain }),
    })
  }

  return (
    <StyledPanel data-testid="VaultChainItem-Panel" {...pressHandlers}>
      <HStack fullWidth alignItems="center" gap={12}>
        <ChainEntityIcon
          value={getChainLogoSrc(chain)}
          style={{ fontSize: iconStyle === 'station' ? 36 : 32 }}
        />

        <VStack fullWidth alignItems="start" gap={12}>
          <HStack
            fullWidth
            alignItems="center"
            justifyContent="space-between"
            gap={20}
          >
            <VStack>
              <Text color="contrast" size={14}>
                {chain}
              </Text>
              <AddressRow
                alignItems="center"
                gap={4}
                onClick={handleCopyAddress}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleCopyAddress(e)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Copy ${chain} address`}
              >
                <Text weight={500} color="shy" size={12}>
                  {formatWalletAddress(address)}
                </Text>
                <SquareBehindSquare6Icon />
              </AddressRow>
            </VStack>
            <HStack gap={8} alignItems="center">
              <VStack
                gap={8}
                justifyContent="space-between"
                alignItems="flex-end"
              >
                {children}
              </VStack>
              <IconWrapper>
                {iconStyle === 'station' ? (
                  <StationChevronRightSmallIcon />
                ) : (
                  <ChevronRightIcon />
                )}
              </IconWrapper>
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </StyledPanel>
  )
}

const StyledPanel = styled(Panel)`
  cursor: pointer;

  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }

  ${({ theme }) =>
    theme.iconStyle === 'station' &&
    css`
      border-radius: 0;
      background: ${theme.colors.foreground.toCssValue()};
      padding: 12px;

      &:hover {
        background: ${theme.colors.foregroundDark.toCssValue()};
      }
    `}
`

const AddressRow = styled(HStack)`
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`
