import { Chain } from '@core/chain/Chain'
import { getMoneroChainTip } from '@core/chain/chains/monero/chainTip'
import { getMoneroAddress } from '@core/chain/chains/monero/getMoneroAddress'
import { getMoneroScanStorage } from '@core/chain/chains/monero/moneroScanStorage'
import { getMoneroVaultData } from '@core/chain/chains/monero/moneroVaultData'
import { scanMoneroBlocks } from '@core/chain/chains/monero/scanner'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { initializeFromt } from '@core/mpc/fromt/initialize'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { OnCloseProp } from '@lib/ui/props'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { fromt_keyshare_birthday } from 'fromt-wasm'
import { useTranslation } from 'react-i18next'

import { ChainSyncModal } from '../ChainSyncModal'

export const MoneroSyncModal = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()
  const refetchQueries = useRefetchQueries()
  const coins = useCurrentVaultChainCoins(Chain.Monero)

  const setup = async () => {
    const vaultData = getMoneroVaultData()
    if (!vaultData) throw new Error('No Monero vault data')

    await initializeFromt()
    const keyShare = new Uint8Array(Buffer.from(vaultData.keyShare, 'base64'))
    const birthday = Number(fromt_keyshare_birthday(keyShare))
    const identifier = await getMoneroAddress(vaultData.keyShare)
    let chainTip: number | null = null
    try {
      chainTip = await getMoneroChainTip()
    } catch {
      // chain tip fetch failed, continue without it
    }
    return { identifier, birthday: birthday || null, chainTip }
  }

  const loadScanHeight = async (_address: string) => {
    const vaultData = getMoneroVaultData()
    if (!vaultData) return null

    const data = await getMoneroScanStorage().load(vaultData.publicKeyEcdsa)
    return data?.scanHeight ?? null
  }

  const loadScanTarget = async (_address: string) => {
    const vaultData = getMoneroVaultData()
    if (!vaultData) return null

    const data = await getMoneroScanStorage().load(vaultData.publicKeyEcdsa)
    return data?.scanTarget ?? null
  }

  const resetScanHeight = async (
    _address: string,
    _birthday: number | null
  ) => {
    const vaultData = getMoneroVaultData()
    if (!vaultData) return

    const data = await getMoneroScanStorage().load(vaultData.publicKeyEcdsa)
    if (!data) return

    await getMoneroScanStorage().save({
      ...data,
      scanHeight: null,
      scanTarget: null,
      birthdayScanDone: false,
      balance: '0',
      totalOutputs: 0,
      spentOutputs: 0,
      spendDetectionMode: 'wallet+local',
      walletKeysData: undefined,
      walletCacheData: undefined,
      outputs: [],
    })

    scanMoneroBlocks({
      keyShareBase64: vaultData.keyShare,
      publicKeyEcdsa: vaultData.publicKeyEcdsa,
    }).catch(err => console.error('Monero scan after reset failed:', err))
  }

  return (
    <ChainSyncModal
      onClose={onClose}
      title={t('monero_sync_status')}
      setup={setup}
      loadScanHeight={loadScanHeight}
      loadScanTarget={loadScanTarget}
      resetScanHeight={resetScanHeight}
      onSynced={async () => {
        await refetchQueries(
          ...coins.map(extractAccountCoinKey).map(getBalanceQueryKey)
        )
      }}
    />
  )
}
