import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
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
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/StartKeysignPrompt'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const selectedCoin = depositFormData['selectedCoin']
    ? (depositFormData['selectedCoin'] as AccountCoin)
    : null
  const coin = useCurrentVaultCoin(
    selectedCoin ? extractAccountCoinKey(selectedCoin) : coinKey
  )

  const transactionType =
    action === 'ibc_transfer' ? TransactionType.IBC_TRANSFER : undefined
  const chainSpecificQuery = useDepositChainSpecificQuery(transactionType)
  const vault = useCurrentVault()
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

    const keysignPayload = create(KeysignPayloadSchema, {
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
    })

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
      ])
    ) {
      keysignPayload.toAddress = shouldBePresent(
        isTonFunction ? validatorAddress : receiver
      )
    }

    if (!isOneOf(action, ['vote'])) {
      keysignPayload.toAmount = toChainAmount(
        shouldBePresent(amount),
        coin.decimals
      ).toString()
    }

    return { keysign: keysignPayload }
  }, [
    action,
    amount,
    chainSpecificQuery.data,
    chainSpecificQuery.isLoading,
    coin,
    isTonFunction,
    memo,
    receiver,
    validatorAddress,
    vault.hexChainCode,
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

  return <StartKeysignPrompt value={keysignPayload} />
}
