import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import { coinKeyFromString } from '@core/chain/coin/Coin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { toHexPublicKey } from '../../../chain/utils/toHexPublicKey'
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams'
import { StartKeysignPrompt } from '../../keysign/components/StartKeysignPrompt'
import { ChainAction } from '../ChainAction'
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin'
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
  const [{ coin: coinName }] = useAppPathParams<'deposit'>()
  const { chain: chain } = coinKeyFromString(coinName)
  const isTonFunction = chain === Chain.Ton
  const { t } = useTranslation()
  const [coinKey] = useCurrentDepositCoin()
  const coin = useCurrentVaultCoin(coinKey)
  const chainSpecificQuery = useDepositChainSpecificQuery()
  const vault = useCurrentVault()
  const config = transactionConfig[action] || {}

  const receiver = config.requiresNodeAddress
    ? (depositFormData['nodeAddress'] as string)
    : ''

  const validatorAddress = depositFormData['validatorAddress'] as string

  const amount = config.requiresAmount ? Number(depositFormData['amount']) : 0

  const memo = (depositFormData['memo'] as string) ?? ''

  const walletCore = useAssertWalletCore()

  const keysignPayload = useMemo(() => {
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

    if (isOneOf(action, ['unstake', 'leave', 'unbound', 'stake', 'bond'])) {
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

  if (chainSpecificQuery.isLoading) {
    return <Text>{t('loading')}</Text>
  }

  return <StartKeysignPrompt value={keysignPayload} />
}
