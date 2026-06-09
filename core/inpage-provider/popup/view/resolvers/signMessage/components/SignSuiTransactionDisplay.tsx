import { Collapse } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Collapse'
import {
  collectInputHints,
  InputHint,
  renderMoveType,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/core/sui/abi'
import {
  decodedPureDisplay,
  decodedPureLabel,
  decodePureValue,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/core/sui/decodePure'
import {
  knownMoveCallEntry,
  knownObjectLabel,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/core/sui/knownEntities'
import {
  SuiArgument,
  SuiCommand,
  SuiPtbInput,
  SuiTxData,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/core/sui/types'
import {
  SuiObjectInfo,
  useSuiPtbMetadataQuery,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/core/sui/useSuiPtbMetadata'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

const mistPerSui = 1_000_000_000n

// Move type tags carry a long package address that drowns the readable bit.
// Compress `0xabc…::module::Name` to just `Name`; generics keep the same
// treatment recursively so `Coin<0xabc…::navx::NAVX>` becomes `Coin<NAVX>`.
const shortenMoveType = (typeTag: string): string =>
  typeTag.replace(/0x[0-9a-fA-F]+::([^,<>\s]+)::([^,<>\s]+)/g, '$2::$3')

const formatSuiAmount = (mist: string): string => {
  const value = BigInt(mist)
  const whole = value / mistPerSui
  const fractional = value % mistPerSui
  if (fractional === 0n) return `${whole.toString()} SUI`
  const fractionalStr = fractional
    .toString()
    .padStart(9, '0')
    .replace(/0+$/, '')
  return `${whole.toString()}.${fractionalStr} SUI`
}

const renderArgument = (arg: SuiArgument): string => {
  switch (arg.kind) {
    case 'GasCoin':
      return 'GasCoin'
    case 'Input':
      return `Input ${arg.index}`
    case 'Result':
      return `↳ Result of cmd ${arg.index}`
    case 'NestedResult':
      return `↳ Result of cmd ${arg.commandIndex}[${arg.resultIndex}]`
  }
}

type CommandRowProps = {
  command: SuiCommand
  index: number
  /** Parameter labels (`["coin", "amount"]`) from the static known-call map
   * for this MoveCall, if any — overrides the generic "Arguments:" line. */
  knownLabel?: string
  paramNames?: string[]
}

const CommandRow: FC<CommandRowProps> = ({
  command,
  index,
  knownLabel,
  paramNames,
}) => {
  const { t } = useTranslation()
  switch (command.kind) {
    case 'MoveCall':
      return (
        <VStack gap={4}>
          <Text size={13} weight={500} color="contrast">
            {index}. {knownLabel ?? t('sui_move_call')}
          </Text>
          <Text size={12} color="shy" family="mono">
            <MiddleTruncate
              text={`${command.package}::${command.module}::${command.function}`}
              size={12}
            />
          </Text>
          {command.typeArguments.length > 0 && (
            <Text size={12} color="shy">
              {t('sui_type_arguments')}:{' '}
              {command.typeArguments.map(shortenMoveType).join(', ')}
            </Text>
          )}
          {command.arguments.length > 0 && (
            <Text size={12} color="shy">
              {t('sui_arguments')}:{' '}
              {command.arguments
                .map((arg, argIdx) => {
                  const rendered = renderArgument(arg)
                  const name = paramNames?.[argIdx]
                  return name ? `${name}=${rendered}` : rendered
                })
                .join(', ')}
            </Text>
          )}
        </VStack>
      )
    case 'TransferObjects':
      return (
        <VStack gap={4}>
          <Text size={13} weight={500} color="contrast">
            {index}. {t('sui_transfer_objects')}
          </Text>
          <Text size={12} color="shy">
            {t('sui_objects_to', {
              count: command.objects.length,
              address: renderArgument(command.address),
            })}
          </Text>
          <Text size={12} color="shy">
            {command.objects.map(renderArgument).join(', ')}
          </Text>
        </VStack>
      )
    case 'SplitCoins':
      return (
        <VStack gap={4}>
          <Text size={13} weight={500} color="contrast">
            {index}. {t('sui_split_coins')}
          </Text>
          <Text size={12} color="shy">
            {t('sui_split_from', { coin: renderArgument(command.coin) })}
          </Text>
          <Text size={12} color="shy">
            {t('sui_split_amounts', { count: command.amounts.length })}:{' '}
            {command.amounts.map(renderArgument).join(', ')}
          </Text>
        </VStack>
      )
    case 'MergeCoins':
      return (
        <VStack gap={4}>
          <Text size={13} weight={500} color="contrast">
            {index}. {t('sui_merge_coins')}
          </Text>
          <Text size={12} color="shy">
            {t('sui_merge_into', {
              count: command.sources.length,
              destination: renderArgument(command.destination),
            })}
          </Text>
          <Text size={12} color="shy">
            {command.sources.map(renderArgument).join(', ')}
          </Text>
        </VStack>
      )
    case 'Publish':
      return (
        <VStack gap={4}>
          <Text size={13} weight={500} color="contrast">
            {index}. {t('sui_publish')}
          </Text>
          <Text size={12} color="shy">
            {t('sui_modules')}: {command.moduleCount}, {t('sui_dependencies')}:{' '}
            {command.dependencyCount}
          </Text>
        </VStack>
      )
    case 'MakeMoveVec':
      return (
        <VStack gap={4}>
          <Text size={13} weight={500} color="contrast">
            {index}. {t('sui_make_move_vec')}
          </Text>
          {command.type && (
            <Text size={12} color="shy" family="mono">
              <MiddleTruncate text={command.type} size={12} />
            </Text>
          )}
          <Text size={12} color="shy">
            {t('sui_elements')}: {command.elements.length}
          </Text>
        </VStack>
      )
    case 'Upgrade':
      return (
        <VStack gap={4}>
          <Text size={13} weight={500} color="contrast">
            {index}. {t('sui_upgrade')}
          </Text>
          <Text size={12} color="shy" family="mono">
            <MiddleTruncate text={command.package} size={12} />
          </Text>
          <Text size={12} color="shy">
            {t('sui_modules')}: {command.moduleCount}, {t('sui_dependencies')}:{' '}
            {command.dependencyCount}
          </Text>
        </VStack>
      )
  }
}

type InputRowProps = {
  input: SuiPtbInput
  index: number
  hint?: InputHint
  objectInfo?: SuiObjectInfo
}

const InputRow: FC<InputRowProps> = ({ input, index, hint, objectInfo }) => {
  const { t } = useTranslation()
  if (input.kind === 'pure') {
    const decoded = decodePureValue(input.bytes, hint?.primitive)
    const display = decodedPureDisplay(decoded)
    const typeLabel = hint
      ? renderMoveType(hint.type)
      : decodedPureLabel(decoded)
    return (
      <VStack gap={2}>
        <Text size={13} weight={500} color="contrast">
          [{index}] {t('sui_input_pure')} · {typeLabel}
        </Text>
        <Text size={12} color="shy" family="mono">
          {display ? (
            decoded.kind === 'address' ? (
              <MiddleTruncate text={display} size={12} />
            ) : (
              display
            )
          ) : (
            <MiddleTruncate text={input.bytes} size={12} />
          )}
        </Text>
      </VStack>
    )
  }
  const isMutable =
    input.objectKind === 'SharedObject' ? input.mutable : undefined
  const friendlyName =
    knownObjectLabel(input.objectId) ??
    (objectInfo?.type ? shortenMoveType(objectInfo.type) : undefined)
  return (
    <VStack gap={2}>
      <Text size={13} weight={500} color="contrast">
        [{index}] {friendlyName ?? input.objectKind}
        {isMutable !== undefined ? ` (${isMutable ? 'mut' : 'read-only'})` : ''}
      </Text>
      <Text size={12} color="shy" family="mono">
        <MiddleTruncate text={input.objectId} size={12} />
      </Text>
    </VStack>
  )
}

type SignSuiTransactionDisplayProps = { data: SuiTxData }

export const SignSuiTransactionDisplay: FC<SignSuiTransactionDisplayProps> = ({
  data,
}) => {
  const { t } = useTranslation()
  const metadataQuery = useSuiPtbMetadataQuery(data)
  const abis = metadataQuery.data?.abis ?? new Map()
  const objects = metadataQuery.data?.objects ?? new Map()
  const inputHints = collectInputHints(data.commands, abis)

  return (
    <VStack gap={16}>
      <Panel>
        <VStack gap={12}>
          <Text size={14} weight={500} color="contrast">
            {t('sui_transaction_summary')}
          </Text>
          <HStack alignItems="center" justifyContent="space-between" gap={8}>
            <Text size={13} color="shy">
              {t('from')}
            </Text>
            <MiddleTruncate
              text={data.sender}
              size={13}
              justifyContent="end"
              flexGrow
            />
          </HStack>
          <HStack alignItems="center" justifyContent="space-between" gap={8}>
            <Text size={13} color="shy">
              {t('sui_gas_budget')}
            </Text>
            <Text size={13} color="contrast">
              {formatSuiAmount(data.gasData.budget)}
            </Text>
          </HStack>
          <HStack alignItems="center" justifyContent="space-between" gap={8}>
            <Text size={13} color="shy">
              {t('sui_gas_price')}
            </Text>
            <Text size={13} color="contrast">
              {data.gasData.price} MIST
            </Text>
          </HStack>
        </VStack>
      </Panel>
      {data.commands.length > 0 && (
        <Collapse
          title={t('sui_commands', { count: data.commands.length })}
          transparent
        >
          <VStack gap={12}>
            {data.commands.map((command, index) => {
              const known =
                command.kind === 'MoveCall'
                  ? knownMoveCallEntry(
                      command.package,
                      command.module,
                      command.function
                    )
                  : undefined
              return (
                <CommandRow
                  key={index}
                  command={command}
                  index={index}
                  knownLabel={known?.label}
                  paramNames={known?.params}
                />
              )
            })}
          </VStack>
        </Collapse>
      )}
      {data.inputs.length > 0 && (
        <Collapse
          title={t('sui_inputs', { count: data.inputs.length })}
          transparent
        >
          <VStack gap={8}>
            {data.inputs.map((input, index) => (
              <InputRow
                key={index}
                input={input}
                index={index}
                hint={inputHints.get(index)}
                objectInfo={
                  input.kind === 'object'
                    ? objects.get(input.objectId)
                    : undefined
                }
              />
            ))}
          </VStack>
        </Collapse>
      )}
    </VStack>
  )
}
