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
import { buildChainSpecific } from '@core/mpc/keysign/chainSpecific/build'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt, withFallback } from '@lib/utils/attempt'
import { match } from '@lib/utils/match'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { useCallback } from 'react'

import { useAssertWalletCore } from '../../../../chain/providers/WalletCoreProvider'
import { useCurrentVault } from '../../../state/currentVault'
import { useDepositReceiver } from '../../hooks/useDepositReceiver'
import { useDepositAction } from '../../providers/DepositActionProvider'
import { useDepositCoin } from '../../providers/DepositCoinProvider'
import { useDepositFeeQuoteQuery } from '../../queries/useDepositFeeQuoteQuery'
import { useDepositKeysignTxDataQuery } from '../../queries/useDepositKeysignTxDataQuery'
import { resolvers, selectStakeId } from '../../staking/resolvers'
import {
  NativeTcyInput,
  RujiInput,
  StakeKind,
  StcyInput,
} from '../../staking/types'
import { useDepositData } from '../../state/data'

export function useDepositKeysignPayloadQuery() {
  const [action] = useDepositAction()
  const depositData = useDepositData()

  const isUnmerge = action === 'unmerge'
  const isStake = isOneOf(action, ['stake', 'unstake', 'withdraw_ruji_rewards'])

  const [coin] = useDepositCoin()
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()

  const isTonFunction = coin.chain === Chain.Ton
  const slippage = Number(depositData['slippage'] ?? 0)
  const memo = (depositData['memo'] as string) ?? ''
  const validatorAddress = depositData['validatorAddress'] as string | undefined

  const autocompound = Boolean(depositData['autoCompound'])

  const hasAmount = 'amount' in depositData
  const amount = hasAmount ? Number(depositData['amount']) : undefined

  const receiver = useDepositReceiver()

  const txData = useDepositKeysignTxDataQuery()
  const feeQuote = useDepositFeeQuoteQuery()

  return useTransformQueriesData(
    { txData, feeQuote },
    useCallback(
      ({ txData, feeQuote }) => {
        const publicKey = getPublicKey({
          chain: coin.chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
        })

        const blockchainSpecific = buildChainSpecific({
          chain: coin.chain,
          txData,
          feeQuote,
        })

        const basePayload: any = {
          coin: toCommCoin({
            ...coin,
            address: coin.address,
            hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
          }),
          memo,
          blockchainSpecific,
          vaultLocalPartyId: vault.localPartyId,
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          libType: vault.libType,
          utxoInfo: txData.utxoInfo,
        }

        if (receiver) basePayload.toAddress = receiver
        if (hasAmount && Number.isFinite(amount)) {
          basePayload.toAmount = toChainAmount(
            amount!,
            coin.decimals
          ).toString()
        }

        const stakeId = isStake
          ? withFallback(
              attempt(() => selectStakeId(coin, { autocompound })),
              undefined
            )
          : undefined

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
                const raw = depositData['percentage']

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
            return create(KeysignPayloadSchema, basePayload)
          }

          delete basePayload.contractPayload
          basePayload.memo = intent.memo
          basePayload.toAddress = ''
          basePayload.toAmount = intent.toAmount ?? '0'
          return create(KeysignPayloadSchema, basePayload)
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
            return create(KeysignPayloadSchema, basePayload)
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
          return create(KeysignPayloadSchema, basePayload)
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

        return create(KeysignPayloadSchema, basePayload)
      },
      [
        action,
        amount,
        autocompound,
        coin,
        depositData,
        hasAmount,
        isStake,
        isTonFunction,
        isUnmerge,
        memo,
        receiver,
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
}
