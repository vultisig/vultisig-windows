import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const txHashStoreQueryKey = ['txHashes']
const [txHashStoreKey] = txHashStoreQueryKey

export type TxHashesStore = Record<string, string> // uid -> txHash

export const getTxHashesStore = async (): Promise<TxHashesStore> => {
  return getPersistentState<TxHashesStore>(txHashStoreKey, {})
}

export const setTxHashesStore = async (
  hashes: TxHashesStore
): Promise<void> => {
  await setPersistentState<TxHashesStore>(txHashStoreKey, hashes)
}

export const setTxHash = async (uid: string, txHash: string): Promise<void> => {
  const allTxHashes = await getTxHashesStore()
  const updated = {
    ...allTxHashes,
    [uid]: txHash,
  }
  await setTxHashesStore(updated)
}

export const getTxHash = async (uid: string): Promise<string | undefined> => {
  const allTxHashes = await getTxHashesStore()
  return allTxHashes[uid]
}

export const useTxHash = (uid: string) => {
  return useQuery({
    queryKey: ['txHash', uid],
    queryFn: () => getTxHash(uid),
  })
}

export const useSetTxHash = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ uid, txHash }: { uid: string; txHash: string }) => {
      await setTxHash(uid, txHash)
      return txHash
    },
    onSuccess: (_txHash, { uid }) => {
      queryClient.invalidateQueries({ queryKey: ['txHash', uid] })
    },
  })
}
