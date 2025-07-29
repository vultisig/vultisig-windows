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
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../../../chain/providers/WalletCoreProvider'
import { useCoreViewState } from '../../../../navigation/hooks/useCoreViewState'
import { useCurrentVault } from '../../../state/currentVault'
import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'
import { ChainAction } from '../../ChainAction'
import { useDepositChainSpecificQuery } from '../../queries/useDepositChainSpecificQuery'
import { transactionConfig } from '../config'

export function useDepositConfirmLogic(
  depositFormData: Record<string, unknown>,
  action: ChainAction
) {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const isTonFunction = coinKey.chain === Chain.Ton
  const isUnmerge = action === 'unmerge'
  const { t } = useTranslation()

  // Resolve coin and vault
  const selectedCoin = depositFormData['selectedCoin'] as
    | AccountCoin
    | undefined
  const coin = useCurrentVaultCoin(
    selectedCoin ? extractAccountCoinKey(selectedCoin) : coinKey
  )
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()

  // Determine transaction type & chain-specific data
  const transactionType =
    action === 'ibc_transfer'
      ? TransactionType.IBC_TRANSFER
      : isUnmerge
        ? TransactionType.THOR_UNMERGE
        : action === 'merge'
          ? TransactionType.THOR_MERGE
          : undefined

  const chainSpecificQuery = useDepositChainSpecificQuery(transactionType, coin)

  // Form field values and validation
  const config = transactionConfig(coinKey.chain)[action] || {}
  const receiver = config.requiresNodeAddress
    ? (depositFormData['nodeAddress'] as string)
    : ''
  const validatorAddress = depositFormData['validatorAddress'] as string
  const amount = config.requiresAmount ? Number(depositFormData['amount']) : 0
  const memo = (depositFormData['memo'] as string) ?? ''

  const invalid =
    (config.requiresAmount && (!Number.isFinite(amount) || amount < 0)) ||
    (config.requiresNodeAddress && !receiver && !isTonFunction)
  const invalidMessage = invalid ? t('required_field_missing') : undefined

  // Build keysign payload
  const keysignPayloadQuery = useTransformQueryData(
    chainSpecificQuery,
    useCallback(
      chainSpecific => {
        const publicKey = getPublicKey({
          chain: coin.chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
        })

        const basePayload: any = {
          coin: toCommCoin({
            ...coin,
            hexPublicKey: toHexPublicKey({ publicKey, walletCore }),
          }),
          memo,
          blockchainSpecific: chainSpecific,
          vaultLocalPartyId: vault.localPartyId,
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          libType: vault.libType,
        }

        // Common address/amount logic
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
          const reverseLookup = mirrorRecord(
            kujiraCoinMigratedToThorChainDestinationId
          )
          const tokenKey = reverseLookup[shouldBePresent(coin.id)]
          const contractAddress = tokenKey
            ? kujiraCoinThorChainMergeContracts[tokenKey]
            : (() => {
                throw new Error(
                  `Unknown unmerge contract for token: ${coin.ticker}`
                )
              })()

          basePayload.toAddress = contractAddress
          basePayload.toAmount = toChainAmount(
            shouldBePresent(amount),
            coin.decimals
          ).toString()
        } else if (!isOneOf(action, ['vote'])) {
          basePayload.toAmount = toChainAmount(
            shouldBePresent(amount),
            coin.decimals
          ).toString()
        }

        return { keysign: create(KeysignPayloadSchema, basePayload) }
      },
      [
        action,
        amount,
        coin,
        isTonFunction,
        isUnmerge,
        memo,
        receiver,
        validatorAddress,
        vault.hexChainCode,
        vault.libType,
        vault.localPartyId,
        vault.publicKeys,
        walletCore,
      ]
    )
  )

  return { invalid, invalidMessage, keysignPayloadQuery }
}
