import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { centerContent } from '../css/centerContent'
import { toSizeUnit } from '../css/toSizeUnit'
import { Spinner } from '../loaders/Spinner'
import { StrictText } from '../text'
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
