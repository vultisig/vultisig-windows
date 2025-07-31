import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import {
  affiliateAddress,
  affiliateContract,
  yRUNEContract,
  yRUNEReceiptDenom,
  yTCYContract,
  yTCYReceiptDenom,
} from '@core/chain/chains/cosmos/thor/ytcy-and-yrune/config'
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
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../../../chain/providers/WalletCoreProvider'
import { useCoreViewState } from '../../../../navigation/hooks/useCoreViewState'
import { useCurrentVault } from '../../../state/currentVault'
import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'
import { ChainAction } from '../../ChainAction'
import { useDepositChainSpecificQuery } from '../../queries/useDepositChainSpecificQuery'
import { transactionConfig } from '../config'

export function useDepositKeysignPayload(
  depositFormData: Record<string, unknown>,
  action: ChainAction
) {
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

  // core helpers
  const selectedCoin = depositFormData['selectedCoin'] as
    | AccountCoin
    | undefined
  const coin = useCurrentVaultCoin(
    selectedCoin ? extractAccountCoinKey(selectedCoin) : coinKey
  )
  const vault = useCurrentVault()
  const wallet = useAssertWalletCore()
  const chainSpecificQuery = useDepositChainSpecificQuery(txType, coin)

  // form values
  const cfg = transactionConfig(coinKey.chain)[action] || {}
  const rawAmount = cfg.requiresAmount ? Number(depositFormData['amount']) : 0
  const slippage = Number(depositFormData['slippage'] ?? 0) // percent e.g. 1 or 2.5
  const memo = ''

  // invalid?
  const invalid =
    cfg.requiresAmount && (!Number.isFinite(rawAmount) || rawAmount < 0)
  const invalidMessage = invalid ? t('required_field_missing') : undefined

  const keysignPayloadQuery = useTransformQueryData(
    chainSpecificQuery,
    useCallback(
      chainSpecific => {
        // build the base keysign payload
        const pubkey = getPublicKey({
          chain: coin.chain,
          walletCore: wallet,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
        })
        const base: any = {
          coin: toCommCoin({
            ...coin,
            hexPublicKey: toHexPublicKey({
              publicKey: pubkey,
              walletCore: wallet,
            }),
          }),
          memo,
          blockchainSpecific: chainSpecific,
          vaultLocalPartyId: vault.localPartyId,
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          libType: vault.libType,
        }

        if (
          action === 'deposit_yRune' ||
          action === 'deposit_yTcy' ||
          action === 'withdraw_yRune' ||
          action === 'withdraw_yTcy'
        ) {
          const isDepositRune = action === 'deposit_yRune'
          const isDepositTcy = action === 'deposit_yTcy'
          const isSellRune = action === 'withdraw_yRune'

          const amountUnits = toChainAmount(
            shouldBePresent(rawAmount),
            coin.decimals
          ).toString()

          let wasmMsg: any

          if (isDepositRune || isDepositTcy) {
            wasmMsg = {
              execute: {
                contract_addr: isDepositRune ? yRUNEContract : yTCYContract,
                msg: Buffer.from(JSON.stringify({ deposit: {} })).toString(
                  'base64'
                ),
                affiliate: [affiliateAddress, 10],
              },
            }
          } else {
            wasmMsg = { withdraw: { slippage: (slippage / 100).toFixed(4) } }
          }

          const contractAddr =
            isDepositRune || isDepositTcy
              ? affiliateContract
              : isSellRune
                ? yRUNEContract
                : yTCYContract

          base.contractPayload = {
            case: 'wasmExecuteContractPayload',
            value: {
              senderAddress: coin.address,
              contractAddress: contractAddr,
              executeMsg: JSON.stringify(wasmMsg),
              coins:
                isDepositRune || isDepositTcy
                  ? [
                      {
                        contractAddress: isDepositRune ? 'rune' : 'tcy',
                        amount: amountUnits,
                      },
                    ]
                  : [
                      {
                        contractAddress: isSellRune
                          ? yRUNEReceiptDenom
                          : yTCYReceiptDenom,
                        amount: amountUnits,
                      },
                    ],
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
