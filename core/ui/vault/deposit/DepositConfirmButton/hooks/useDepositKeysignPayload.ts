import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain, CosmosChain } from '@core/chain/Chain'
import {
  kujiraCoinMigratedToThorChainDestinationId,
  kujiraCoinThorChainMergeContracts,
} from '@core/chain/chains/cosmos/thor/kujira-merge'
import { rujiraStakingConfig } from '@core/chain/chains/cosmos/thor/rujira/config'
import {
  yieldBearingAssetsAffiliateAddress,
  yieldBearingAssetsAffiliateContract,
  yieldBearingAssetsContracts,
  yieldBearingAssetsReceiptDenoms,
} from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
import {
  AccountCoin,
  extractAccountCoinKey,
} from '@core/chain/coin/AccountCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { getDenom } from '@core/chain/coin/utils/getDenom'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
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

  const isUnmerge = action === 'unmerge'
  const txType =
    action === 'ibc_transfer'
      ? TransactionType.IBC_TRANSFER
      : isUnmerge
        ? TransactionType.THOR_UNMERGE
        : action === 'merge'
          ? TransactionType.THOR_MERGE
          : action === 'stake_ruji' ||
              action === 'unstake_ruji' ||
              action === 'withdraw_ruji_rewards' ||
              action === 'mint' ||
              action === 'redeem'
            ? TransactionType.GENERIC_CONTRACT
            : undefined

  const selectedCoin = depositFormData['selectedCoin'] as
    | AccountCoin
    | undefined
  const coin = useCurrentVaultCoin(
    selectedCoin ? extractAccountCoinKey(selectedCoin) : coinKey
  )
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const chainSpecificQuery = useDepositChainSpecificQuery(txType, coin)
  const isTonFunction = coinKey.chain === Chain.Ton
  const cfg = transactionConfig(coinKey.chain)[action] || {}
  const amount = cfg.requiresAmount ? Number(depositFormData['amount']) : 0
  const slippage = Number(depositFormData['slippage'] ?? 0)
  const memo = (depositFormData['memo'] as string) ?? ''
  const invalid = cfg.requiresAmount && (!Number.isFinite(amount) || amount < 0)
  const invalidMessage = invalid ? t('required_field_missing') : undefined
  const validatorAddress = depositFormData['validatorAddress'] as string
  const isRujiAction =
    action === 'stake_ruji' ||
    action === 'unstake_ruji' ||
    action === 'withdraw_ruji_rewards'
  const receiver = cfg.requiresNodeAddress
    ? (depositFormData['nodeAddress'] as string)
    : ''

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
            hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
          }),
          memo,
          blockchainSpecific: chainSpecific,
          vaultLocalPartyId: vault.localPartyId,
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          libType: vault.libType,
        }

        if (
          isOneOf(action, [
            'stake_ruji',
            'unstake_ruji',
            'withdraw_ruji_rewards',
          ])
        ) {
          const amount = Number(depositFormData['amount'] ?? 0)
          const amountUnits =
            action === 'stake_ruji'
              ? toChainAmount(amount, selectedCoin!.decimals).toString()
              : action === 'unstake_ruji'
                ? toChainAmount(amount, selectedCoin!.decimals).toString()
                : '0'

          const executeInnerObj =
            action === 'stake_ruji'
              ? { account: { bond: {} } }
              : action === 'unstake_ruji'
                ? { account: { withdraw: { amount: amountUnits } } }
                : { account: { claim: {} } }

          const executeInner = JSON.stringify(executeInnerObj)

          basePayload.contractPayload = {
            case: 'wasmExecuteContractPayload',
            value: {
              senderAddress: coin.address,
              contractAddress: rujiraStakingConfig.contract,
              executeMsg: executeInner,
              coins:
                action === 'stake_ruji'
                  ? [
                      {
                        denom: rujiraStakingConfig.bondDenom,
                        amount: amountUnits,
                      },
                    ]
                  : [],
            },
          }
          basePayload.toAddress = rujiraStakingConfig.contract
          basePayload.toAmount = action === 'stake_ruji' ? amountUnits : '0'

          return { keysign: create(KeysignPayloadSchema, basePayload) }
        }

        if (action === 'mint' || action === 'redeem') {
          // Figure out which vault we target from the selected coin
          const selectedTicker = coin.ticker?.toLowerCase()
          const isDeposit = action === 'mint'
          const amountUnits = toChainAmount(
            shouldBePresent(amount),
            coin.decimals
          ).toString()

          // Resolve contract & funds
          let contractAddress: string
          let funds: Array<{ denom: string; amount: string }>

          if (isDeposit) {
            // User selected base asset (RUNE or TCY)
            const isRuneMint = selectedTicker === 'rune'
            contractAddress = yieldBearingAssetsAffiliateContract
            const targetYContract =
              yieldBearingAssetsContracts[isRuneMint ? 'yRUNE' : 'yTCY']

            const executeInner = {
              execute: {
                contract_addr: targetYContract,
                msg: Buffer.from(JSON.stringify({ deposit: {} })).toString(
                  'base64'
                ),
                affiliate: [yieldBearingAssetsAffiliateAddress, 10],
              },
            }

            funds = [
              { denom: isRuneMint ? 'rune' : 'tcy', amount: amountUnits },
            ]

            basePayload.contractPayload = {
              case: 'wasmExecuteContractPayload',
              value: {
                senderAddress: coin.address,
                contractAddress, // affiliate contract
                executeMsg: JSON.stringify(executeInner),
                coins: funds, // denom + amount (NOT contractAddress)
              },
            }
          } else {
            // Redeem: user selected receipt token (yRUNE/yTCY)
            const isYRUNE = coin.id === yieldBearingAssetsReceiptDenoms.yRUNE
            const yContract =
              yieldBearingAssetsContracts[isYRUNE ? 'yRUNE' : 'yTCY']

            const executeInner = {
              withdraw: { slippage: (slippage / 100).toFixed(2) },
            } // 2dp like Android

            funds = [
              {
                denom: getDenom(coin as CoinKey<CosmosChain>),
                amount: amountUnits,
              },
            ]

            basePayload.contractPayload = {
              case: 'wasmExecuteContractPayload',
              value: {
                senderAddress: coin.address,
                contractAddress: yContract,
                executeMsg: JSON.stringify(executeInner),
                coins: funds,
              },
            }
          }

          basePayload.toAmount = amountUnits
          basePayload.memo = memo

          return { keysign: create(KeysignPayloadSchema, basePayload) }
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
          basePayload.toAddress = shouldBePresent(
            isRujiAction
              ? rujiraStakingConfig.contract
              : isTonFunction
                ? validatorAddress
                : receiver
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
          const tokenKey = reverseLookup[shouldBePresent(coin.id)]
          if (tokenKey) {
            contractAddress = kujiraCoinThorChainMergeContracts[tokenKey]
          } else {
            throw new Error(
              `Unknown unmerge contract for token: ${coin.ticker}`
            )
          }

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
        depositFormData,
        isRujiAction,
        isTonFunction,
        isUnmerge,
        memo,
        receiver,
        selectedCoin,
        slippage,
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
