import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { InputProps, OptionsProp } from '@lib/ui/props'
import { without } from '@lib/utils/array/without'
import { FC } from 'react'

import { AddVaultsToFolderContainer } from './AddVaultsToFolderContainer'
import { FolderVaultOption } from './FolderVaultOption'

type FolderVaultsInputProps = InputProps<string[]> &
  OptionsProp<Vault & { coins: AccountCoin[] }>

export const FolderVaultsInput: FC<FolderVaultsInputProps> = ({
  value,
  onChange,
  options,
}) => {
  return (
    <AddVaultsToFolderContainer>
      {options.map(vault => {
        const vaultId = getVaultId(vault)

        return (
          <CurrentVaultProvider value={vault} key={vaultId}>
            <FolderVaultOption
              value={value.includes(vaultId)}
              onChange={item =>
                onChange(item ? [...value, vaultId] : without(value, vaultId))
              }
              key={vaultId}
            />
          </CurrentVaultProvider>
        )
      })}
    </AddVaultsToFolderContainer>
  )
}
