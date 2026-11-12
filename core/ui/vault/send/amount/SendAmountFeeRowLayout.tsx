import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChevronRightSmallIcon } from '@lib/ui/icons/ChevronRightSmallIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type SendAmountFeeRowLayoutProps = {
  value: ReactNode
  /** Opens the advanced fee settings; without it the row is a plain label. */
  onOpenSettings?: () => void
  hasSettings: boolean
}

/** The "Est. network fee" row of the amount step. */
export const SendAmountFeeRowLayout = ({
  value,
  onOpenSettings,
  hasSettings,
}: SendAmountFeeRowLayoutProps) => {
  const { t } = useTranslation()

  const content = (
    <HStack
      fullWidth
      alignItems="center"
      justifyContent="space-between"
      gap={8}
    >
      <HStack alignItems="center" gap={4}>
        <Text size={12} color="shy">
          {t('est_network_fee')}
        </Text>
        {hasSettings && (
          <Text as="span" size={12} color="shy" centerVertically>
            <ChevronRightSmallIcon />
          </Text>
        )}
      </HStack>
      {value}
    </HStack>
  )

  if (!hasSettings) {
    return <div data-testid="send-network-fee">{content}</div>
  }

  return (
    <RowButton
      disabled={!onOpenSettings}
      onClick={onOpenSettings}
      data-testid="send-network-fee"
    >
      {content}
    </RowButton>
  )
}

const RowButton = styled(UnstyledButton)`
  width: 100%;
  text-align: left;
  ${borderRadius.xs};

  &:disabled {
    cursor: default;
  }

  &:focus-visible {
    outline: 1px solid ${getColor('primaryAccentFour')};
    outline-offset: 4px;
  }
`
