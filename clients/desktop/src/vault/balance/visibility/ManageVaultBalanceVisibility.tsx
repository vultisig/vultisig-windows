import {
  useIsBalanceVisible,
  useSetIsBalanceVisibleMutation,
} from '@core/ui/storage/balanceVisibility'
import { Button } from '@lib/ui/button'
import { EyeIcon } from '@lib/ui/icons/EyeIcon'
import { EyeOffIcon } from '@lib/ui/icons/EyeOffIcon'

export const ManageVaultBalanceVisibility = () => {
  const value = useIsBalanceVisible()
  const { mutateAsync: setIsBalanceVisible } = useSetIsBalanceVisibleMutation()

  return (
    <Button
      icon={value ? <EyeIcon /> : <EyeOffIcon />}
      onClick={() => setIsBalanceVisible(!value)}
      size="lg"
      title={value ? 'Hide balance' : 'Show balance'}
    />
  )
}
