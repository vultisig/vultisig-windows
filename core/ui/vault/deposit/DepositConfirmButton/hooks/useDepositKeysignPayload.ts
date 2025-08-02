import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import {
  YieldBearingAsset,
  yieldBearingAssetsAffiliateAddress,
  yieldBearingAssetsAffiliateContract,
  yieldBearingAssetsContracts,
} from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
import {
  AccountCoin,
  extractAccountCoinKey,
} from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../../../chain/providers/WalletCoreProvider'
import { useCoreViewState } from '../../../../navigation/hooks/useCoreViewState'
import { useCurrentVault } from '../../../state/currentVault'
import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'
import { ChainAction } from '../../ChainAction'
import { useDepositChainSpecificQuery } from '../../queries/useDepositChainSpecificQuery'
import { transactionConfig } from '../config'

type DepositKeysignPayloadProps = {
  depositFormData: Record<string, unknown>
  action: ChainAction
}

export function useDepositKeysignPayload({
  depositFormData,
  action,
}: DepositKeysignPayloadProps) {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const { t } = useTranslation()
  const isTon = coinKey.chain === Chain.Ton

  const isUnmerge = action === 'unmerge'
  const txType =
    action === 'ibc_transfer'
      ? TransactionType.IBC_TRANSFER
      : isUnmerge
        ? TransactionType.THOR_UNMERGE
        : action === 'merge'
          ? TransactionType.THOR_MERGE
          : undefined

  const selectedCoin = depositFormData['selectedCoin'] as
    | AccountCoin
    | undefined
  const coin = useCurrentVaultCoin(
    selectedCoin ? extractAccountCoinKey(selectedCoin) : coinKey
  )
  const vault = useCurrentVault()
  const wallet = useAssertWalletCore()
  const chainSpecificQuery = useDepositChainSpecificQuery(txType, coin)

  const cfg = transactionConfig(coinKey.chain)[action] || {}
  const rawAmount = cfg.requiresAmount ? Number(depositFormData['amount']) : 0
  const slippage = Number(depositFormData['slippage'] ?? 0)
  const memo = ''

  const invalid =
    cfg.requiresAmount && (!Number.isFinite(rawAmount) || rawAmount < 0)
  const invalidMessage = invalid ? t('required_field_missing') : undefined

  const keysignPayloadQuery = useTransformQueryData(
    chainSpecificQuery,
    useCallback(
      chainSpecific => {
        const pubkey = getPublicKey({
          chain: coin.chain,
          walletCore: wallet,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
        })
        const base: any = {
          coin: toCommCoin({
            ...coin,
            hexPublicKey: Buffer.from(pubkey.data()).toString('hex'),
          }),
          memo,
          blockchainSpecific: chainSpecific,
          vaultLocalPartyId: vault.localPartyId,
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          libType: vault.libType,
        }

        if (action === 'mint' || action === 'redeem') {
          const asset = depositFormData['asset'] as YieldBearingAsset
          const isDeposit = action === 'mint'
          const amountUnits = toChainAmount(
            shouldBePresent(rawAmount),
            coin.decimals
          ).toString()

          let executeInner: object
          if (isDeposit) {
            executeInner = {
              execute: {
                // TODO: double check this!
                contract_addr: yieldBearingAssetsContracts[asset],
                msg: Buffer.from(JSON.stringify({ deposit: {} })).toString(
                  'base64'
                ),
                affiliate: [yieldBearingAssetsAffiliateAddress, 10],
              },
            }
          } else {
            executeInner = {
              withdraw: { slippage: (slippage / 100).toFixed(4) },
            }
          }

          base.contractPayload = {
            case: 'wasmExecuteContractPayload',
            value: {
              senderAddress: coin.address,
              contractAddress: isDeposit
                ? yieldBearingAssetsAffiliateContract
                : yieldBearingAssetsContracts[asset],
              executeMsg: JSON.stringify(executeInner),
              coins: isDeposit
                ? [
                    {
                      contractAddress: asset === 'yRUNE' ? 'rune' : 'tcy',
                      amount: amountUnits,
                    },
                  ]
                : [],
            },
          }
          base.toAmount = amountUnits
          return { keysign: create(KeysignPayloadSchema, base) }
        }

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
          base.toAddress = shouldBePresent(
            isTon
              ? (depositFormData['validatorAddress'] as string)
              : (depositFormData['nodeAddress'] as string)
          )
          base.toAmount = toChainAmount(
            shouldBePresent(rawAmount),
            coin.decimals
          ).toString()
        } else if (isUnmerge) {
          // your mirrorRecord unmerge block...
        } else if (!isOneOf(action, ['vote'])) {
          base.toAmount = toChainAmount(
            shouldBePresent(rawAmount),
            coin.decimals
          ).toString()
        }

        return { keysign: create(KeysignPayloadSchema, base) }
      },
      [
        action,
        coin,
        depositFormData,
        isTon,
        isUnmerge,
        rawAmount,
        slippage,
        vault.hexChainCode,
        vault.libType,
        vault.localPartyId,
        vault.publicKeys,
        wallet,
      ]
    )
  )

  return { invalid, invalidMessage, keysignPayloadQuery }
}
