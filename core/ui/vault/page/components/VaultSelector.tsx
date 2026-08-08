import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import styled, { css } from 'styled-components'

type VaultSelectorPlacement = 'inline' | 'pageHeader'

const Indicator = styled(CollapsableStateIndicator)`
  font-size: 12px;
`

export const VaultSelector = ({
  value,
  placement = 'inline',
}: ValueProp<Vault> & { placement?: VaultSelectorPlacement }) => {
  const navigate = useCoreNavigate()
  const isFastVault = hasServer(value.signers)

  return (
    <Wrapper
      onClick={() => {
        navigate({ id: 'vaults' })
      }}
      placement={placement}
      role="button"
      tabIndex={0}
    >
      <HStack gap={4} alignItems="center" style={{ minWidth: 0, flex: 1 }}>
        <IconWrapper color={isFastVault ? 'idle' : 'primary'} size={16}>
          {isFastVault ? <LightningIcon /> : <ShieldIcon />}
        </IconWrapper>
        <Text size={14} cropped>
          {value.name}
        </Text>
      </HStack>
      <Indicator />
    </Wrapper>
  )
}

const Wrapper = styled.div<{ placement: VaultSelectorPlacement }>`
  ${hStack({
    alignItems: 'center',
    gap: 8,
  })};

  cursor: pointer;
  max-width: 60%;
  min-width: 0;

  ${({ placement, theme }) =>
    theme.iconStyle === 'station' &&
    placement === 'pageHeader' &&
    css`
      max-width: 156px;
      transform: translateX(-18px);
      width: 156px;
    `}
`
