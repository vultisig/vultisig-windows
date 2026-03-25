import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { ProtocolStatuses } from '@core/ui/mpc/keygen/state/keygenAction'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const protocolLabels: Record<KeygenStep, string> = {
  prepareVault: 'Prepare',
  ecdsa: 'ECDSA',
  eddsa: 'EdDSA',
  chainKeys: 'Chain Keys',
  mldsa: 'MLDSA',
}

const Container = styled.div`
  background: ${getColor('foreground')};
  border-radius: 16px;
  padding: 16px;
  margin: 0 16px;
`

const Row = styled(HStack)`
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  gap: 12px;
`

const StatusWrapper = styled(HStack)`
  align-items: center;
  gap: 6px;
  min-width: 100px;
`

export const KeygenProtocolStatusList = ({
  protocols,
}: {
  protocols: ProtocolStatuses
}) => {
  const { t } = useTranslation()
  const entries = Object.entries(protocols) as [
    KeygenStep,
    { status: 'in_progress' | 'completed' },
  ][]

  if (entries.length === 0) return null

  return (
    <Container>
      <SeparatedByLine gap={0}>
        {entries.map(([protocol, info]) => (
          <Row key={protocol}>
            <Text size={14} weight={600} style={{ minWidth: 80 }}>
              {protocolLabels[protocol]}
            </Text>
            <StatusWrapper>
              {info.status === 'completed' ? (
                <CheckIcon style={{ color: '#4fae6e', fontSize: 16 }} />
              ) : (
                <Spinner size={16} />
              )}
              <Text
                size={13}
                color={info.status === 'completed' ? 'success' : 'shy'}
              >
                {info.status === 'completed'
                  ? t('keygen_protocol_done')
                  : t('keygen_protocol_running')}
              </Text>
            </StatusWrapper>
          </Row>
        ))}
      </SeparatedByLine>
    </Container>
  )
}
