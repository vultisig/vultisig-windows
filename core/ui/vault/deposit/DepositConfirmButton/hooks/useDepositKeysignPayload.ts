import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain, CosmosChain } from '@core/chain/Chain'
import {
  kujiraCoinMigratedToThorChainDestinationId,
  kujiraCoinThorChainMergeContracts,
} from '@core/chain/chains/cosmos/thor/kujira-merge'
import {
  yieldBearingAssetsAffiliateAddress,
  yieldBearingAssetsAffiliateContract,
  yieldBearingAssetsContracts,
  yieldBearingAssetsReceiptDenoms,
} from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
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
import { useCurrentVault } from '../../../state/currentVault'
import { ChainAction } from '../../ChainAction'
import { useDepositCoin } from '../../providers/DepositCoinProvider'
import { useDepositChainSpecificQuery } from '../../queries/useDepositChainSpecificQuery'
import { toStakeKind } from '../../staking/kinds'
import { pickStakeResolver } from '../../staking/resolvers'
import type { StakeInput } from '../../staking/types'

type DepositKeysignPayloadProps = {
  depositFormData: Record<string, unknown>
  action: ChainAction
}

export function useDepositKeysignPayload({
  depositFormData,
  action,
}: DepositKeysignPayloadProps) {
  const { t } = useTranslation()

  const isUnmerge = action === 'unmerge'
  const stakeKind = toStakeKind(action)

  const [coin] = useDepositCoin()
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()

  const autocompound = Boolean(depositFormData['autoCompound'])

  let isStakeContractFlow = false
  if (stakeKind) {
    try {
      const resolver = pickStakeResolver(coin, { autocompound })
      isStakeContractFlow = resolver.id !== 'native-tcy'
    } catch {
      isStakeContractFlow = false
    }
  }

  let txType: TransactionType | undefined
  if (action === 'ibc_transfer') txType = TransactionType.IBC_TRANSFER
  else if (action === 'merge') txType = TransactionType.THOR_MERGE
  else if (action === 'unmerge') txType = TransactionType.THOR_UNMERGE
  else if (action === 'mint' || action === 'redeem' || isStakeContractFlow)
    txType = TransactionType.GENERIC_CONTRACT
  else txType = undefined

  const chainSpecificQuery = useDepositChainSpecificQuery(coin, txType)

  const isTonFunction = coin.chain === Chain.Ton
  const slippage = Number(depositFormData['slippage'] ?? 0)
  const memo = (depositFormData['memo'] as string) ?? ''
  const validatorAddress = depositFormData['validatorAddress'] as string

  const hasAmount = 'amount' in depositFormData
  const amount = hasAmount ? Number(depositFormData['amount']) : undefined

  const hasNodeAddress = 'nodeAddress' in depositFormData
  const receiver = hasNodeAddress
    ? String(depositFormData['nodeAddress'] || '')
    : undefined

  const invalid =
    hasAmount && (amount == null || !Number.isFinite(amount) || amount <= 0)
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

        const basePayload: any = {
          coin: toCommCoin({
            ...coin,
            address: coin.address,
            hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
          }),
          memo,
          blockchainSpecific: chainSpecific,
          vaultLocalPartyId: vault.localPartyId,
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          libType: vault.libType,
        }

        if (receiver) basePayload.toAddress = receiver
        if (hasAmount && Number.isFinite(amount)) {
          basePayload.toAmount = toChainAmount(
            amount!,
            coin.decimals
          ).toString()
        }

        if (stakeKind) {
          const provider = pickStakeResolver(coin, { autocompound })

          let stakeInput: StakeInput
          if (stakeKind === 'stake') {
            stakeInput = { kind: 'stake', amount: shouldBePresent(amount) }
          } else if (stakeKind === 'unstake') {
            const percentage = depositFormData['percentage'] as
              | number
              | undefined

            stakeInput = amount
              ? { kind: 'unstake', amount }
              : { kind: 'unstake', percentage: shouldBePresent(percentage) }
          } else {
            stakeInput = { kind: 'claim' }
          }

          const intent = provider.buildIntent(stakeKind, stakeInput!, { coin })

          if (intent.kind === 'wasm') {
            basePayload.contractPayload = {
              case: 'wasmExecuteContractPayload',
              value: {
                senderAddress: coin.address,
                contractAddress: intent.contract,
                executeMsg:
                  typeof intent.executeMsg === 'string'
                    ? intent.executeMsg
                    : JSON.stringify(intent.executeMsg),
                coins: intent.funds,
              },
            }
            basePayload.toAddress = intent.contract
            basePayload.toAmount = intent.funds?.[0]?.amount ?? '0'
            return { keysign: create(KeysignPayloadSchema, basePayload) }
          }

          // Native TCY memo path
          basePayload.memo = intent.memo
          if (intent.toAddress) basePayload.toAddress = intent.toAddress
          basePayload.toAmount = intent.toAmount ?? '0'
          return { keysign: create(KeysignPayloadSchema, basePayload) }
        }

        // ─────────────────────────────────────────────────────────────
        // Mint / Redeem (unchanged)
        // ─────────────────────────────────────────────────────────────
        if (action === 'mint' || action === 'redeem') {
          const isDeposit = action === 'mint'
          const amountUnits = toChainAmount(
            shouldBePresent(amount),
            coin.decimals
          ).toString()

          let contractAddress: string
          let funds: Array<{ denom: string; amount: string }>

          if (isDeposit) {
            const baseDenom = getDenom(coin as CoinKey<CosmosChain>)
            if (baseDenom !== 'rune' && baseDenom !== 'tcy') {
              throw new Error('Mint supports RUNE/TCY only')
            }
            contractAddress = yieldBearingAssetsAffiliateContract
            const targetYContract =
              yieldBearingAssetsContracts[
                baseDenom === 'rune' ? 'yRUNE' : 'yTCY'
              ]

            const executeInner = {
              execute: {
                contract_addr: targetYContract,
                msg: Buffer.from(JSON.stringify({ deposit: {} })).toString(
                  'base64'
                ),
                affiliate: [yieldBearingAssetsAffiliateAddress, 10],
              },
            }

            funds = [{ denom: baseDenom, amount: amountUnits }]

            basePayload.contractPayload = {
              case: 'wasmExecuteContractPayload',
              value: {
                senderAddress: coin.address,
                contractAddress,
                executeMsg: JSON.stringify(executeInner),
                coins: funds,
              },
            }
          } else {
            const isYRUNE = coin.id === yieldBearingAssetsReceiptDenoms.yRUNE
            const yContract =
              yieldBearingAssetsContracts[isYRUNE ? 'yRUNE' : 'yTCY']

            const executeInner = {
              withdraw: { slippage: (slippage / 100).toFixed(2) },
            }

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

        // ─────────────────────────────────────────────────────────────
        // Other THOR/Cosmos actions (unchanged)
        // ─────────────────────────────────────────────────────────────
        if (
          isOneOf(action, [
            // NOTE: stake/unstake handled earlier
            'leave',
            'unbound',
            'bond',
            'ibc_transfer',
            'switch',
            'merge',
          ])
        ) {
          if (isTonFunction) {
            basePayload.toAddress = shouldBePresent(validatorAddress)
          } else if (receiver) {
            basePayload.toAddress = receiver
          }
          if (hasAmount && Number.isFinite(amount)) {
            basePayload.toAmount = toChainAmount(
              shouldBePresent(amount),
              coin.decimals
            ).toString()
          }
        } else if (isUnmerge || action === 'unmerge_ruji') {
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
          if (hasAmount && Number.isFinite(amount)) {
            basePayload.toAmount = toChainAmount(
              shouldBePresent(amount),
              coin.decimals
            ).toString()
          }
        }

        return { keysign: create(KeysignPayloadSchema, basePayload) }
      },
      [
        action,
        amount,
        autocompound,
        coin,
        depositFormData,
        hasAmount,
        isTonFunction,
        isUnmerge,
        memo,
        receiver,
        slippage,
        stakeKind,
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
