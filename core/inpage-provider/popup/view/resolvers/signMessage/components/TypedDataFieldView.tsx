import { CopyableHexRow } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/CopyableHexRow'
import { LabeledValueRow } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/LabeledValueRow'
import {
  FieldLabel,
  FieldRow,
  FieldValue,
  NestedFields,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { TypedDataFieldNode } from '@core/inpage-provider/popup/view/resolvers/signMessage/utils/getTypedDataFieldNodes'
import { VStack } from '@lib/ui/layout/Stack'
import { matchDiscriminatedUnion } from '@vultisig/lib-utils/matchDiscriminatedUnion'
import { FC } from 'react'

type TypedDataFieldViewProps = {
  node: TypedDataFieldNode
}

/**
 * Renders one typed-data field. A struct or array shows its label and type,
 * then its fields or items indented below, one row each, recursively.
 */
export const TypedDataFieldView: FC<TypedDataFieldViewProps> = ({ node }) =>
  matchDiscriminatedUnion(node, 'kind', 'value', {
    text: value => <LabeledValueRow label={node.label} value={value} />,
    hex: value => <CopyableHexRow label={node.label} value={value} />,
    group: ({ typeName, children }) => (
      <VStack gap={12}>
        <FieldRow>
          <FieldLabel as="span" color="shy" size={14} weight={500}>
            {node.label}
          </FieldLabel>
          {typeName ? (
            <FieldValue
              as="span"
              color="shy"
              family="mono"
              size={12}
              weight={500}
            >
              {typeName}
            </FieldValue>
          ) : null}
        </FieldRow>
        <NestedFields gap={12}>
          {children.map((child, index) => (
            <TypedDataFieldView key={index} node={child} />
          ))}
        </NestedFields>
      </VStack>
    ),
  })
