import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { VaultShareBadge } from '@core/ui/vault/backup/select/VaultShareBadge'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Image } from '@lib/ui/image/Image'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import styled from 'styled-components'

type VaultMenuRowProps = {
  vault: Vault
  onSelect: () => void
  selected: boolean
  balance?: number
}

/** A vault in the referral vault menu; its name wraps so two long names stay apart. */
export const VaultMenuRow = ({
  vault,
  onSelect,
  selected,
  balance,
}: VaultMenuRowProps) => {
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <Row
      $selected={selected}
      alignItems="center"
      data-testid="vault-list-row"
      gap={12}
      onClick={onSelect}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <Image
        alt=""
        height={28}
        src="/core/images/vault-image-placeholder.png"
        style={{ flexShrink: 0, objectFit: 'contain' }}
        width={28}
      />
      <Details>
        <Name variant="stationBodyS">{vault.name}</Name>
        {balance !== undefined && (
          <Text color="shy" variant="caption">
            {formatFiatAmount(balance)}
          </Text>
        )}
      </Details>
      <VaultShareBadge value={vault} />
      <IconWrapper color={selected ? 'success' : undefined} size={16}>
        {selected ? <CheckIcon /> : <ChevronRightIcon />}
      </IconWrapper>
    </Row>
  )
}

const Row = styled(HStack)<{ $selected: boolean }>`
  background: ${({ $selected }) =>
    getColor($selected ? 'foregroundExtra' : 'foreground')};
  cursor: pointer;
  min-height: 58px;
  padding: 12px 20px;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }

  &:focus-visible {
    outline: 1px solid ${getColor('primary')};
    outline-offset: -1px;
  }
`

const Details = styled(VStack)`
  flex: 1;
  min-width: 0;
`

const Name = styled(Text)`
  overflow-wrap: anywhere;
`
