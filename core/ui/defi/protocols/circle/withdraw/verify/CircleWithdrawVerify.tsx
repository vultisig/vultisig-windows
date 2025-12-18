import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { CirclePageContainer } from '../../CirclePageContainer'

type CircleWithdrawVerifyProps = ValueProp<bigint> & OnBackProp

export const CircleWithdrawVerify = ({ onBack }: CircleWithdrawVerifyProps) => {
  const { t } = useTranslation()

  return (
    <>
      <TitleHeader title={t('circle.verify_withdraw')} onBack={onBack} />
      <CirclePageContainer>
        <VStack alignItems="center" justifyContent="center" flexGrow>
          <Text color="shy">{t('coming_soon')}</Text>
        </VStack>
      </CirclePageContainer>
    </>
  )
}
