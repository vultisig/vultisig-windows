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
        ? TransactionType.UNSPECIFIED // Using UNSPECIFIED instead of THOR_UNMERGE due to DKLS library bug that causes signing to fail
        : undefined

  const chainSpecificQuery = useDepositChainSpecificQuery(
    transactionType,
    selectedCoin
  )
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
      basePayload.toAmount = toChainAmount(
        shouldBePresent(amount),
        coin.decimals
      ).toString()
    } else if (isUnmerge) {
      let contractAddress: string

      const reverseLookup = mirrorRecord(
        kujiraCoinMigratedToThorChainDestinationId
      )
      const tokenKey = reverseLookup[coin.id]
      if (tokenKey) {
        contractAddress = kujiraCoinThorChainMergeContracts[tokenKey]
      } else {
        throw new Error(`Unknown unmerge contract for token: ${coin.ticker}`)
      }
      // For unmerge, set toAddress and toAmount with the selected coin amount
      basePayload.toAddress = contractAddress
      basePayload.toAmount = toChainAmount(
        shouldBePresent(amount),
        coin.decimals
      ).toString()
    } else if (!isOneOf(action, ['vote'])) {
      // For other actions that need amount
      basePayload.toAmount = toChainAmount(
        shouldBePresent(amount),
        coin.decimals
      ).toString()
    }

    // Create the final payload with all the fields set
    const finalKeysignPayload = create(KeysignPayloadSchema, basePayload)

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

  return <StartKeysignPrompt keysignPayload={keysignPayload} />
}
