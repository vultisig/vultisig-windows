import { useEffect } from 'react'

import { CenterAbsolutely } from '../../../../lib/ui/layout/CenterAbsolutely'
import { Spinner } from '../../../../lib/ui/loaders/Spinner'
import { OnFinishProp } from '../../../../lib/ui/props'
import { useVaults } from '../../../queries/useVaultsQuery'
import { useCurrentVaultId } from '../../../state/currentVaultId'
import { getStorageVaultId } from '../../../utils/storageVault'
import { UploadQRPageResult } from './UploadQRPageResult'

export const CheckVaultStep = ({
  onFinish,
}: OnFinishProp<UploadQRPageResult>) => {
  const [currentVaultId] = useCurrentVaultId()
  const vaults = useVaults()
  const vault = vaults.find(
    vault => getStorageVaultId(vault) === currentVaultId
  )

  useEffect(() => {
    if (vault) {
      onFinish({ vault })
    } else {
      onFinish({ noVault: true })
    }
  }, [vault, onFinish])

  return (
    <CenterAbsolutely>
      <Spinner size="3em" />
    </CenterAbsolutely>
  )
}
