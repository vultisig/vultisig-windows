import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'
import {
  Divider,
  Section,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { TypedDataField } from './TypedDataField'
import { getTypedDataFields } from './typedDataFields'

export const Eip712TypedDataDisplay = ({
  payload,
}: {
  payload: Eip712V4Payload
}) => {
  const { t } = useTranslation()
  const { domain, primaryType, message, types } = payload
  return (
    <Section gap={12} padding={24}>
      {typeof domain.name === 'string' && (
        <>
          <TypedDataField
            label={t('domain')}
            value={domain.name}
            types={types}
          />
          <Divider />
        </>
      )}
      {domain.chainId !== undefined && (
        <>
          <TypedDataField
            label={t('chain_id')}
            value={domain.chainId}
            types={types}
          />
          <Divider />
        </>
      )}
      <TypedDataField
        label={t('primary_type')}
        value={primaryType}
        types={types}
      />
      {getTypedDataFields(message, primaryType, types).map(field => (
        <Fragment key={field.name}>
          <Divider />
          <TypedDataField
            label={field.name}
            type={field.type}
            value={field.value}
            types={types}
          />
        </Fragment>
      ))}
    </Section>
  )
}
