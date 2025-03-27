import { OnFinishProp } from '@lib/ui/props'

type VaultBackupWithoutPasswordProps = OnFinishProp & {
  onPasswordRequest: () => void
}

export const VaultBackupWithoutPassword = ({
  onFinish,
  onPasswordRequest,
}: VaultBackupWithoutPasswordProps) => {
  console.log({ onFinish, onPasswordRequest })
  return <div>VaultBackupWithoutPassword</div>
}
