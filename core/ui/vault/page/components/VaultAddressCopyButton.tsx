import { Chain } from '@core/chain/Chain'
import { VaultAddressCopyToast } from '@core/ui/vault/page/components/VaultAddressCopyToast'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { SquareBehindSquare6Icon } from '@lib/ui/icons/SquareBehindSquare6Icon'
import { hStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import styled from 'styled-components'

export const VaultAddressCopyButton = ({
  value: { address, chain },
}: ValueProp<{ address: string; chain: Chain }>) => {
  const { addToast } = useToast()

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    navigator.clipboard.writeText(address)

    addToast({
      message: '',
      renderContent: () => <VaultAddressCopyToast value={chain} />,
    })
  }

  return (
    <CopyButton
      onClick={handleCopyAddress}
      onPointerDown={handleCopyAddress}
      onPointerUp={handleCopyAddress}
    >
      <SquareBehindSquare6Icon />
    </CopyButton>
  )
}

const CopyButton = styled(UnstyledButton)`
  ${hStack({
    alignItems: 'center',
    justifyContent: 'center',
  })};

  font-size: 12px;
  color: ${getColor('textShy')};
  padding: 4px;
  min-width: 20px;
  min-height: 20px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${getColor('textSupporting')};
  }

  &:active {
    color: ${getColor('contrast')};
  }
`
