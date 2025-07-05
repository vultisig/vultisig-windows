import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import {
  kujiraCoinMigratedToThorChainDestinationId,
  kujiraCoinThorChainMergeContracts,
} from '@core/chain/chains/cosmos/thor/kujira-merge'
import {
  AccountCoin,
  extractAccountCoinKey,
} from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { toHexPublicKey } from '@core/chain/utils/toHexPublicKey'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { StartKeysignPrompt } from '../../../mpc/keysign/prompt/StartKeysignPrompt'
import { ChainAction } from '../ChainAction'
import { useDepositChainSpecificQuery } from '../queries/useDepositChainSpecificQuery'
import { transactionConfig } from './config'

type DepositConfirmButtonProps = {
  depositFormData: Record<string, unknown>
  action: ChainAction
}

export const DepositConfirmButton = ({
  depositFormData,
  action,
}: DepositConfirmButtonProps) => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const isTonFunction = coinKey.chain === Chain.Ton
  const isUnmerge = action === 'unmerge'
  const { t } = useTranslation()
  const selectedCoin = depositFormData['selectedCoin']
    ? (depositFormData['selectedCoin'] as AccountCoin)
    : null
  const coin = useCurrentVaultCoin(
    selectedCoin ? extractAccountCoinKey(selectedCoin) : coinKey
  )

  const vault = useCurrentVault()
  
  const transactionType =
    action === 'ibc_transfer'
      ? TransactionType.IBC_TRANSFER
      : isUnmerge
        ? TransactionType.THOR_UNMERGE
        : undefined
  
  // For chain specific query, we need a coin with address
  const coinForChainQuery = selectedCoin && coin.address
    ? { ...selectedCoin, address: coin.address } as AccountCoin
    : selectedCoin
    
  const chainSpecificQuery = useDepositChainSpecificQuery(transactionType, coinForChainQuery)
  const config = transactionConfig(coinKey.chain)[action] || {}
  const receiver = config.requiresNodeAddress
    ? (depositFormData['nodeAddress'] as string)
    : ''

  const validatorAddress = depositFormData['validatorAddress'] as string

  const amount = config.requiresAmount ? Number(depositFormData['amount']) : 0

  const memo = (depositFormData['memo'] as string) ?? ''

  const walletCore = useAssertWalletCore()

  const keysignPayload = useMemo(() => {
    if (chainSpecificQuery.isLoading) return

    console.log('=== UNMERGE KEYSIGN DEBUG ===')
    console.log('Action:', action)
    console.log('Is Unmerge:', isUnmerge)
    console.log('Coin:', coin)
    console.log('Selected Coin:', selectedCoin)
    console.log('Amount (raw input):', depositFormData['amount'])
    console.log('Amount (parsed):', amount)
    console.log('Memo:', memo)
    console.log('Transaction Type:', transactionType)
    console.log('Chain Specific Data:', chainSpecificQuery.data)
    console.log('Vault publicKeys:', vault.publicKeys)
    console.log('Deposit Form Data:', depositFormData)

    // TODO: handle affiliate fee and percentage
    const publicKey = getPublicKey({
      chain: coin.chain,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
    })

    const basePayload: any = {
      coin: toCommCoin({
        ...coin,
        hexPublicKey: toHexPublicKey({
          publicKey,
          walletCore,
        }),
      }),
      memo,
      blockchainSpecific: shouldBePresent(chainSpecificQuery.data),
      vaultLocalPartyId: vault.localPartyId,
      vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
      libType: vault.libType,
    }

    // Build the payload dynamically based on action
    if (
      isOneOf(action, [
        'unstake',
        'leave',
        'unbound',
        'stake',
        'bond',
        'ibc_transfer',
        'switch',
        'merge',
        'unmerge_ruji',
      ])
    ) {
      basePayload.toAddress = shouldBePresent(
        isTonFunction ? validatorAddress : receiver
      )
      basePayload.toAmount = toChainAmount(shouldBePresent(amount), coin.decimals).toString()
    } else if (isUnmerge) {
      // Determine the correct contract address based on the token
      let contractAddress: string
      // For Kujira tokens migrated to THORChain
      const reverseLookup = mirrorRecord(kujiraCoinMigratedToThorChainDestinationId)
      const tokenKey = reverseLookup[coin.id]
      if (tokenKey) {
        contractAddress = kujiraCoinThorChainMergeContracts[tokenKey]
      } else {
        throw new Error(`Unknown unmerge contract for token: ${coin.ticker}`)
      }
      // For unmerge, set toAddress and toAmount with the selected coin amount
      basePayload.toAddress = contractAddress
      basePayload.toAmount = toChainAmount(shouldBePresent(amount), coin.decimals).toString()
    } else if (!isOneOf(action, ['vote'])) {
      // For other actions that need amount
      basePayload.toAmount = toChainAmount(shouldBePresent(amount), coin.decimals).toString()
    }
    
    // Create the final payload with all the fields set
    const finalKeysignPayload = create(KeysignPayloadSchema, basePayload)

    console.log('=== FINAL KEYSIGN PAYLOAD ===')
    console.log('To Address:', finalKeysignPayload.toAddress)
    console.log('To Amount:', finalKeysignPayload.toAmount)
    console.log('Memo:', finalKeysignPayload.memo)
    console.log('Coin:', finalKeysignPayload.coin)
    console.log('Blockchain Specific:', finalKeysignPayload.blockchainSpecific)
    console.log('Full Payload:', finalKeysignPayload)

    return { keysign: finalKeysignPayload }
  }, [
    action,
    amount,
    chainSpecificQuery.data,
    chainSpecificQuery.isLoading,
    coin,
    isUnmerge,
    isTonFunction,
    memo,
    receiver,
    validatorAddress,
    vault.hexChainCode,
    vault.libType,
    vault.localPartyId,
    vault.publicKeys,
    walletCore,
  ])

  if (
    (config.requiresAmount && !Number.isFinite(amount)) ||
    amount < 0 ||
    (config.requiresNodeAddress && !receiver && !isTonFunction)
  ) {
    return <Text color="danger">{t('required_field_missing')}</Text>
  }

  if (chainSpecificQuery.error) {
    return <Text color="danger">{t('failed_to_load')}</Text>
  }

  if (chainSpecificQuery.isLoading || !keysignPayload) {
    return <Text>{t('loading')}</Text>
  }

  console.log('## keysign payload', keysignPayload)

  return <StartKeysignPrompt keysignPayload={keysignPayload} />
}
