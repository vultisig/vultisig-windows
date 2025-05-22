import {
  useIsBalanceVisible,
  useSetIsBalanceVisibleMutation,
} from '@core/ui/storage/balanceVisibility'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { EyeIcon } from '@lib/ui/icons/EyeIcon'
import { EyeOffIcon } from '@lib/ui/icons/EyeOffIcon'

export const ManageVaultBalanceVisibility = () => {
  const value = useIsBalanceVisible()
  const { mutateAsync: setIsBalanceVisible } = useSetIsBalanceVisibleMutation()

  return (
    <IconButton
      size="l"
      icon={value ? <EyeIcon /> : <EyeOffIcon />}
      onClick={() => setIsBalanceVisible(!value)}
      title={value ? 'Hide balance' : 'Show balance'}
    />
  )
}
