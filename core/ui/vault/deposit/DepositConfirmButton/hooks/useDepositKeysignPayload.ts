import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain, CosmosChain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import {
  kujiraCoinMigratedToThorChainDestinationId,
  kujiraCoinThorChainMergeContracts,
} from '@core/chain/chains/cosmos/thor/kujira-merge'
import {
  yieldBearingAssetsAffiliateAddress,
  yieldBearingAssetsAffiliateContract,
  yieldBearingTokensIdToContractMap,
  yieldContractsByBaseDenom,
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
import { attempt } from '@lib/utils/attempt'
import { match } from '@lib/utils/match'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../../../chain/providers/WalletCoreProvider'
import { useCurrentVault } from '../../../state/currentVault'
import { ChainAction } from '../../ChainAction'
import { useDepositFormConfig } from '../../hooks/useDepositFormConfig'
import { useDepositCoin } from '../../providers/DepositCoinProvider'
import { useDepositChainSpecificQuery } from '../../queries/useDepositChainSpecificQuery'
import { stakeModeById } from '../../staking/config'
import { resolvers, selectStakeId } from '../../staking/resolvers'
import {
  NativeTcyInput,
  RujiInput,
  StakeKind,
  StcyInput,
} from '../../staking/types'

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
  const isStake = isOneOf(action, ['stake', 'unstake', 'withdraw_ruji_rewards'])

  const [coin] = useDepositCoin()
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()

  const autocompound = Boolean(depositFormData['autoCompound'])

  let stakeId: ReturnType<typeof selectStakeId> | undefined = undefined
  let isStakeContractFlow = false

  if (isStake) {
    const result = attempt(() => selectStakeId(coin, { autocompound }))
    if ('data' in result) {
      stakeId = shouldBePresent(result.data)
      isStakeContractFlow = stakeModeById[stakeId] === 'wasm'
    } else {
      isStakeContractFlow = false
    }
  }

  let txType: TransactionType | undefined
  if (action === 'ibc_transfer') txType = TransactionType.IBC_TRANSFER
  else if (action === 'merge') txType = TransactionType.THOR_MERGE
  else if (action === 'unmerge') txType = TransactionType.THOR_UNMERGE
  else if (action === 'mint' || action === 'redeem' || isStakeContractFlow)
    txType = TransactionType.GENERIC_CONTRACT

  const chainSpecificQuery = useDepositChainSpecificQuery(coin, txType)
  const config = useDepositFormConfig()
  const amountFieldConfig = config.fields.find(field => field.name === 'amount')

  const isTonFunction = coin.chain === Chain.Ton
  const slippage = Number(depositFormData['slippage'] ?? 0)
  const memo = (depositFormData['memo'] as string) ?? ''
  const validatorAddress = depositFormData['validatorAddress'] as
    | string
    | undefined

  const hasAmount = 'amount' in depositFormData
  const amount = hasAmount ? Number(depositFormData['amount']) : undefined

  const nodeAddressRaw = depositFormData['nodeAddress']
  const receiver =
    typeof nodeAddressRaw === 'string' && nodeAddressRaw.length > 0
      ? nodeAddressRaw
      : undefined

  const invalid =
    hasAmount &&
    amountFieldConfig?.required &&
    (amount == null || !Number.isFinite(amount) || amount <= 0)
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

        if (isStake && stakeId) {
          const actionAsStakeAction =
            action === 'withdraw_ruji_rewards' ? 'claim' : (action as StakeKind)

          const stakeSpecific = resolvers[stakeId]

          let input: RujiInput | NativeTcyInput | StcyInput | null = null

          match(actionAsStakeAction, {
            stake: () => {
              input = { kind: 'stake', amount: shouldBePresent(amount) }
            },
            unstake: () => {
              if (stakeId === 'stcy') {
                input = { kind: 'unstake', amount: shouldBePresent(amount) }
              } else if (stakeId === 'native-tcy') {
                const raw = depositFormData['percentage']

                const pct =
                  typeof raw === 'string' && raw.trim() === ''
                    ? NaN
                    : Number(raw)

                const pctValid = Number.isFinite(pct) && pct > 0 && pct <= 100
                input = pctValid
                  ? { kind: 'unstake', percentage: pct }
                  : { kind: 'unstake', amount: shouldBePresent(amount) }
              } else {
                input = {
                  kind: 'unstake',
                  amount: shouldBePresent(amount),
                }
              }
            },
            claim: () => {
              input = { kind: 'claim' }
            },
          })

          if (!input) {
            throw new Error('Failed to construct stake input')
          }

          const intent = stakeSpecific({
            coin,
            input,
          })

          if (intent.kind === 'wasm') {
            basePayload.memo = ''
            basePayload.toAddress = ''
            basePayload.toAmount = '0'
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
            return { keysign: create(KeysignPayloadSchema, basePayload) }
          }

          delete basePayload.contractPayload
          basePayload.memo = intent.memo
          basePayload.toAddress = ''
          basePayload.toAmount = intent.toAmount ?? '0'
          return { keysign: create(KeysignPayloadSchema, basePayload) }
        }

        if (action === 'mint' || action === 'redeem') {
          const isDeposit = action === 'mint'
          const amountUnits = toChainAmount(
            shouldBePresent(amount),
            coin.decimals
          ).toString()

          let funds: Array<{ denom: string; amount: string }>

          if (isDeposit) {
            if (!isChainOfKind(coin.chain, 'cosmos')) {
              throw new Error(
                'Only Cosmos chains support Mint / Redeem actions'
              )
            }

            const baseDenom = getDenom(coin as CoinKey<CosmosChain>)
            if (baseDenom !== 'rune' && baseDenom !== 'tcy') {
              throw new Error('Mint supports RUNE/TCY only')
            }

            const targetYContract = yieldContractsByBaseDenom[baseDenom]

            const executeInner = {
              execute: {
                contract_addr: targetYContract,
                msg: Buffer.from(JSON.stringify({ deposit: {} })).toString(
                  'base64'
                ),
                affiliate: [yieldBearingAssetsAffiliateAddress, 10],
              },
            }

            const funds = [{ denom: baseDenom, amount: amountUnits }]

            basePayload.memo = ''
            basePayload.contractPayload = {
              case: 'wasmExecuteContractPayload',
              value: {
                senderAddress: coin.address,
                contractAddress: yieldBearingAssetsAffiliateContract,
                executeMsg: JSON.stringify(executeInner),
                coins: funds,
              },
            }

            basePayload.toAmount = amountUnits
            return { keysign: create(KeysignPayloadSchema, basePayload) }
          } else {
            const assertedCoinId = shouldBePresent(coin.id)

            const contractAddress =
              yieldBearingTokensIdToContractMap[assertedCoinId]

            const executeInner = {
              withdraw: { slippage: (slippage / 100).toFixed(2) },
            }

            funds = [
              {
                denom: getDenom(coin as CoinKey<CosmosChain>),
                amount: amountUnits,
              },
            ]

            basePayload.memo = ''
            basePayload.contractPayload = {
              case: 'wasmExecuteContractPayload',
              value: {
                senderAddress: coin.address,
                contractAddress: shouldBePresent(contractAddress),
                executeMsg: JSON.stringify(executeInner),
                coins: funds,
              },
            }
          }

          basePayload.toAmount = amountUnits
          return { keysign: create(KeysignPayloadSchema, basePayload) }
        }

        if (
          isOneOf(action, [
            'leave',
            'unbound',
            'bond',
            'ibc_transfer',
            'switch',
            'merge',
          ])
        ) {
          delete basePayload.contractPayload
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
        coin,
        depositFormData,
        hasAmount,
        isStake,
        isTonFunction,
        isUnmerge,
        memo,
        receiver,
        slippage,
        stakeId,
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
