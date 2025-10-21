import {
  useIsBalanceVisible,
  useSetIsBalanceVisibleMutation,
} from '@core/ui/storage/balanceVisibility'
import { EyeClosedIcon } from '@lib/ui/icons/EyeClosedIcon'
import { EyeIcon } from '@lib/ui/icons/EyeIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

export const ManageVaultBalanceVisibility = () => {
  const value = useIsBalanceVisible()
  const { mutateAsync: setIsBalanceVisible } = useSetIsBalanceVisibleMutation()

  return (
    <Wrapper
      role="button"
      tabIndex={0}
      onClick={() => setIsBalanceVisible(!value)}
    >
      <IconWrapper color="primaryAlt" size={16}>
        {value ? <EyeClosedIcon /> : <EyeIcon />}
      </IconWrapper>
      <Text size={12} color="primaryAlt">
        {value ? 'Hide balance' : 'Show balance'}
      </Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  padding: 4px 6px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  background: rgba(81, 128, 252, 0.12);
`
