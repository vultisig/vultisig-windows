import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { VStack } from '@lib/ui/layout/Stack'
import { fitPageContent } from '@lib/ui/page/PageContent'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CircleDepositForm } from './CircleDepositForm'

type CircleDepositViewProps = {
  onBack: () => void
}

export const CircleDepositView = ({ onBack }: CircleDepositViewProps) => {
  const { t } = useTranslation()
  const [amount, setAmount] = useState<bigint | null>(null)

  const handleSubmit = () => {
    console.log('Deposit amount:', amount)
  }

  return (
    <VStack flexGrow>
      <TitleHeader title={t('circle.deposit_header')} onBack={onBack} />
      <Container>
        <CircleDepositForm
          amount={amount}
          onAmountChange={setAmount}
          onSubmit={handleSubmit}
        />
      </Container>
    </VStack>
  )
}

const Container = styled.div`
  ${fitPageContent({ contentMaxWidth: 400 })}
`
