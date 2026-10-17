import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'
import { CopyableHexRow } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/CopyableHexRow'
import { LabeledValueRow } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/LabeledValueRow'
import { TypedDataFieldView } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/TypedDataFieldView'
import {
  Divider,
  Section,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { getTypedDataFieldNodes } from '@core/inpage-provider/popup/view/resolvers/signMessage/utils/getTypedDataFieldNodes'
import { toBigInt } from '@core/inpage-provider/popup/view/resolvers/signMessage/utils/toBigInt'
import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

type TypedDataDisplayProps = {
  payload: Eip712V4Payload
  primaryType: string
}

const isString = (v: unknown): v is string => typeof v === 'string'

/**
 * Field-by-field review of an EIP-712 request no dedicated display covers:
 * the domain, the signed primary type, and every signed message field, with
 * structs and arrays broken out into indented rows.
 */
export const TypedDataDisplay: FC<TypedDataDisplayProps> = ({
  payload,
  primaryType,
}) => {
  const { t } = useTranslation()
  const { domain, types, message } = payload
  const chainId = toBigInt(domain.chainId)
  const fields = getTypedDataFieldNodes({ types, message, primaryType })

  return (
    <Section gap={12} padding={24}>
      {isString(domain.name) ? (
        <>
          <LabeledValueRow label={t('domain')} value={domain.name} />
          <Divider />
        </>
      ) : null}
      {chainId !== undefined ? (
        <>
          <LabeledValueRow label={t('chain_id')} value={chainId.toString()} />
          <Divider />
        </>
      ) : null}
      {isString(domain.verifyingContract) ? (
        <>
          <CopyableHexRow
            label={t('contract')}
            value={domain.verifyingContract}
          />
          <Divider />
        </>
      ) : null}
      <LabeledValueRow label={t('primary_type')} value={primaryType} />
      {fields.map((field, index) => (
        <Fragment key={index}>
          <Divider />
          <TypedDataFieldView node={field} />
        </Fragment>
      ))}
    </Section>
  )
}
