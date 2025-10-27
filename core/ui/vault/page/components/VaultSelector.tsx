import { hasServer } from '@core/mpc/devices/localPartyId'
import { Vault } from '@core/mpc/vault/Vault'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

const Indicator = styled(CollapsableStateIndicator)`
  font-size: 12px;
`

export const VaultSelector = ({ value }: ValueProp<Vault>) => {
  const navigate = useCoreNavigate()
  const isFastVault = hasServer(value.signers)

  return (
    <Wrapper
      onClick={() => {
        navigate({ id: 'vaults' })
      }}
      role="button"
      tabIndex={0}
    >
      <HStack gap={4} alignItems="center">
        <IconWrapper color={isFastVault ? 'idle' : 'primary'} size={16}>
          {isFastVault ? <LightningIcon /> : <ShieldIcon />}
        </IconWrapper>
        <Text size={14}>{value.name}</Text>
      </HStack>
      <Indicator />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${hStack({
    alignItems: 'center',
    gap: 8,
  })};

  cursor: pointer;
`
