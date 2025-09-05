import { create } from '@bufbuild/protobuf'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../../../chain/providers/WalletCoreProvider'
import { useCurrentVault } from '../../../state/currentVault'
import { ChainAction } from '../../ChainAction'
import { useDepositCoin } from '../../providers/DepositCoinProvider'
import { useDepositChainSpecificQuery } from '../../queries/useDepositChainSpecificQuery'
import { selectStakingProvider } from '../../staking/providers'
import { transactionConfig } from '../config'

type Props = { depositFormData: Record<string, unknown>; action: ChainAction }

export function useDepositKeysignPayload({ depositFormData, action }: Props) {
  const { t } = useTranslation()
  const [coin] = useDepositCoin()
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const cfg = transactionConfig(coin.chain)[action] || {}
  const amount = cfg.requiresAmount ? Number(depositFormData['amount']) : 0
  const percentage = Number(depositFormData['percentage'] ?? 100)
  const autoCompoundTcy = !!depositFormData['autoCompoundTcy']
  const autoCompoundTcyUnstake = !!depositFormData['autoCompoundTcyUnstake']
  const stcyUnits = BigInt((depositFormData['stcyUnits'] as string) ?? '0')

  const chainSpecificQuery = useDepositChainSpecificQuery(
    coin,
    action === 'stake' ||
      action === 'unstake' ||
      action === 'withdraw_ruji_rewards'
      ? TransactionType.GENERIC_CONTRACT // default; will be downgraded for native
      : undefined
  )

  const invalid = cfg.requiresAmount && (!Number.isFinite(amount) || amount < 0)
  const invalidMessage = invalid ? t('required_field_missing') : undefined

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

        const base: any = {
          coin: toCommCoin({
            ...coin,
            address: coin.address,
            hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
          }),
          memo: '',
          blockchainSpecific: chainSpecific,
          vaultLocalPartyId: vault.localPartyId,
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          libType: vault.libType,
        }

        const isStake = action === 'stake'
        const isUnstake = action === 'unstake'
        const isClaim = action === 'withdraw_ruji_rewards'
        const provider = selectStakingProvider({
          coin: coin as AccountCoin,
          action: isStake ? 'stake' : isUnstake ? 'unstake' : 'claim',
          autoCompoundTcy: isStake
            ? autoCompoundTcy
            : isUnstake
              ? autoCompoundTcyUnstake
              : undefined,
        })

        let result
        if (isStake) {
          result = provider.buildStake({
            sender: coin.address,
            coin: coin as AccountCoin,
            amount,
          })
        } else if (isUnstake) {
          // RUJI unstake uses explicit amount; pass both for providers
          result = provider.buildUnstake({
            sender: coin.address,
            coin: coin as AccountCoin,
            percentage,
            unitsAvailable: stcyUnits,
          } as any)
        } else if (isClaim && provider.buildClaim) {
          result = provider.buildClaim(coin.address, coin as AccountCoin)
        }

        if (!result) throw new Error('Unsupported action')

        if (result.kind === 'wasm_execute') {
          base.contractPayload = {
            case: 'wasmExecuteContractPayload',
            value: {
              senderAddress: coin.address,
              contractAddress: result.contract,
              executeMsg: result.executeMsg,
              coins: result.funds,
            },
          }
          base.toAddress = result.contract
          base.toAmount = result.toAmount
          base.memo = ''
          return { keysign: create(KeysignPayloadSchema, base) }
        }

        if (result.kind === 'bank_send') {
          base.toAmount = result.toAmount
          base.memo = result.memo
          return { keysign: create(KeysignPayloadSchema, base) }
        }

        throw new Error('Unknown result type')
      },
      [
        action,
        amount,
        percentage,
        stcyUnits,
        autoCompoundTcy,
        autoCompoundTcyUnstake,
        coin,
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
