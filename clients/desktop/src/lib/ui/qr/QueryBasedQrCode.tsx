import { centerContent } from '@lib/ui/css/centerContent'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { qrCodeDefaultSize } from './config'
import { FramedQrCode } from './FramedQrCode'

const Status = styled.div`
  height: ${toSizeUnit(qrCodeDefaultSize)};
  ${centerContent};
`

export const QueryBasedQrCode = ({ value }: ValueProp<Query<string>>) => {
  const { t } = useTranslation()

  return (
    <MatchQuery
      value={value}
      success={value => <FramedQrCode value={value} />}
      pending={() => (
        <Status>
          <Spinner />
        </Status>
      )}
      error={() => (
        <Status>
          <StrictText>{t('failed_to_generate_qr_code')}</StrictText>
        </Status>
      )}
    />
  )
}
