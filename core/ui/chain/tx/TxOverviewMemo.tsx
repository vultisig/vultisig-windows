import {
  getParsedMemo,
  ParsedMemoParams,
} from '@core/chain/chains/evm/tx/getParsedMemo'
import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const TxOverviewMemo = ({ value }: ValueProp<string>) => {
  const { t } = useTranslation()
  const [parsedMemo, setParsedMemo] = useState<ParsedMemoParams | undefined>(
    undefined
  )

  useEffect(() => {
    getParsedMemo(value)
      .then(setParsedMemo)
      .catch(() => {})
  }, [value])

  return parsedMemo ? (
    <>
      <VStack gap={4}>
        <Text color="shy">{t('function_signature')}</Text>
        <Text color="primary" family="mono" size={14} weight="700">
          {parsedMemo.functionSignature}
        </Text>
      </VStack>
      <VStack gap={4}>
        <Text size={14} color="shy">
          {t('function_arguments')}
        </Text>
        <Text color="primary" family="mono" size={14} weight="700">
          <pre style={{ width: '100%' }}>
            <code
              style={{ display: 'block', overflowX: 'auto', width: '100%' }}
            >
              {parsedMemo.functionArguments}
            </code>
          </pre>
        </Text>
      </VStack>
    </>
  ) : (
    <VStack gap={4}>
      <Text size={14} color="shy">
        {t('memo')}
      </Text>
      <Text color="primary" size={14}>
        {value}
      </Text>
    </VStack>
  )
}
