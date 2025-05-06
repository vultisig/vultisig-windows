import {
  useIsVaultBalanceVisible,
  useSetIsVaultBalanceVisibleMutation,
} from '@core/ui/storage/isVaultBalanceVisible'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { EyeIcon } from '@lib/ui/icons/EyeIcon'
import { EyeOffIcon } from '@lib/ui/icons/EyeOffIcon'

export const ManageVaultBalanceVisibility = () => {
  const value = useIsVaultBalanceVisible()
  const { mutateAsync: setIsVaultBalanceVisible } =
    useSetIsVaultBalanceVisibleMutation()

  return (
    <IconButton
      size="l"
      icon={value ? <EyeIcon /> : <EyeOffIcon />}
      onClick={() => setIsVaultBalanceVisible(!value)}
      title={value ? 'Hide balance' : 'Show balance'}
    />
  )
}
