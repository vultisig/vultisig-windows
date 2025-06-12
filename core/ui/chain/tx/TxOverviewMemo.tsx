import {
  getParsedMemo,
  ParsedMemoParams,
} from '@core/chain/chains/evm/tx/getParsedMemo'
import { VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
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
      <ListItem
        title={t('function_signature')}
        description={
          <VStack as="pre" scrollable>
            <Text as="code" color="primary" family="mono">
              {parsedMemo.functionSignature}
            </Text>
          </VStack>
        }
      />
      <ListItem
        title={t('function_inputs')}
        description={
          <VStack as="pre" scrollable>
            <Text as="code" color="primary" family="mono">
              {parsedMemo.functionArguments}
            </Text>
          </VStack>
        }
      />
    </>
  ) : (
    <ListItem
      title={t('memo')}
      description={
        <Text as="code" color="primary" family="mono">
          {value}
        </Text>
      }
    />
  )
}
