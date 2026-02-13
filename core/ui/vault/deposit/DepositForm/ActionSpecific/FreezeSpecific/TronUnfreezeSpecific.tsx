import { TronResourceType } from '@core/chain/chains/tron/resources'
import { VStack } from '@lib/ui/layout/Stack'
import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'

import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { TronResourceTypePicker } from './TronResourceTypePicker'

const tronResourceTypes: TronResourceType[] = ['BANDWIDTH', 'ENERGY']

const toTronResourceType = (value: unknown): TronResourceType =>
  tronResourceTypes.includes(value as TronResourceType)
    ? (value as TronResourceType)
    : 'BANDWIDTH'

export const TronUnfreezeSpecific = () => {
  const [{ setValue, control, setTronResourceType }] = useDepositFormHandlers()
  const rawResourceType = useWatch({ control, name: 'resourceType' })
  const resourceType = toTronResourceType(rawResourceType)

  useEffect(() => {
    if (!rawResourceType) {
      setValue('resourceType', 'BANDWIDTH')
      setTronResourceType?.('BANDWIDTH')
    }
  }, [rawResourceType, setValue, setTronResourceType])

  return (
    <VStack gap={12}>
      <TronResourceTypePicker
        value={resourceType}
        onChange={value => {
          setValue('resourceType', value)
          setTronResourceType?.(value)
        }}
      />
    </VStack>
  )
}
