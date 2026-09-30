import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled from 'styled-components'

import { getTypedDataFields, isTypedDataRecord } from './typedDataFields'

type TypedDataFieldProps = {
  label: string
  type?: string
  value: unknown
  types: Eip712V4Payload['types']
  depth?: number
}

const Field = styled(VStack)`
  min-width: 0;
  text-align: left;
`

const FieldText = styled(Text)`
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`

const Children = styled(VStack)<{ $indent: boolean }>`
  min-width: 0;
  padding-left: ${({ $indent }) => ($indent ? 12 : 0)}px;
  border-left: 1px solid ${getColor('foregroundSuper')};
`

export const TypedDataField = ({
  label,
  type,
  value,
  types,
  depth = 0,
}: TypedDataFieldProps) => {
  const { t } = useTranslation()
  const [, copyToClipboard] = useCopyToClipboard()
  const arrayElementType = type?.match(/^(.*)\[\d*\]$/)?.[1]
  const children = Array.isArray(value)
    ? value.map((item, index) => ({
        name: `[${index}]`,
        type: arrayElementType,
        value: item,
      }))
    : isTypedDataRecord(value)
      ? getTypedDataFields(value, type, types)
      : undefined
  const canCopy =
    typeof value === 'string' &&
    (type === 'address' ||
      /^bytes\d*$/.test(type ?? '') ||
      /^0x[\da-f]+$/i.test(value))
  const text = children
    ? undefined
    : value === null
      ? 'null'
      : value === undefined
        ? 'undefined'
        : typeof value === 'string' && value.length === 0
          ? '""'
          : String(value)

  return (
    <Field gap={6}>
      <HStack alignItems="center" justifyContent="space-between" gap={8}>
        <FieldText as="span" color="shy" size={14} weight={500}>
          {label}
        </FieldText>
        {canCopy && typeof value === 'string' && (
          <IconButton
            aria-label={`${t('copy')} ${label}`}
            title={t('copy')}
            size="xs"
            onClick={() => copyToClipboard(value)}
          >
            <ClipboardCopyIcon />
          </IconButton>
        )}
      </HStack>
      {children ? (
        children.length ? (
          <Children gap={12} $indent={depth < 4}>
            {children.map(child => (
              <TypedDataField
                key={child.name}
                label={child.name}
                type={child.type}
                value={child.value}
                types={types}
                depth={depth + 1}
              />
            ))}
          </Children>
        ) : (
          <FieldText size={14}>{Array.isArray(value) ? '[]' : '{}'}</FieldText>
        )
      ) : (
        <FieldText size={14} height="large">
          {text}
        </FieldText>
      )}
    </Field>
  )
}
